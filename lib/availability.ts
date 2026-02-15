/**
 * Availability computation utilities
 *
 * Pure functions for computing available dates and slots.
 * These can be used both in server components (with sanityFetch data)
 * and in server actions.
 */

import {
  addDays,
  addMinutes,
  differenceInDays,
  differenceInMinutes,
  endOfDay,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";

// ============================================================================
// Types
// ============================================================================

export type AvailabilitySlot = {
  _key: string;
  startDateTime: string;
  endDateTime: string;
};

export type BookingSlot = {
  _id: string;
  startTime: string;
  endTime: string;
};

export type BusyTime = {
  start: Date;
  end: Date;
};

// ============================================================================
// Core Computation Functions
// ============================================================================

/**
 * Compute available dates from host availability and existing bookings.
 * This is a pure function that doesn't fetch any data.
 *
 * @param availability - Host's availability slots
 * @param bookings - Existing confirmed bookings
 * @param startDate - Range start
 * @param endDate - Range end
 * @param slotDurationMinutes - Duration of each slot
 * @param busyTimes - Optional Google Calendar busy times
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function computeAvailableDates(
  availability: AvailabilitySlot[],
  bookings: BookingSlot[],
  startDate: Date,
  endDate: Date,
  slotDurationMinutes = 30,
  busyTimes: BusyTime[] = [],
): string[] {
  const today = startOfDay(new Date());
  const totalDays = differenceInDays(endDate, startOfDay(startDate)) + 1;

  return Array.from({ length: totalDays })
    .map((_, index) => addDays(startOfDay(startDate), index))
    .filter((currentDate) => {
      // Skip past dates
      if (currentDate < today) return false;

      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      // Find availability blocks for this day
      const availabilityForDate = availability.filter((slot) => {
        const slotStart = parseISO(slot.startDateTime);
        const slotEnd = parseISO(slot.endDateTime);

        return (
          isWithinInterval(slotStart, { start: dayStart, end: dayEnd }) ||
          isWithinInterval(slotEnd, { start: dayStart, end: dayEnd }) ||
          (slotStart <= dayStart && slotEnd >= dayEnd)
        );
      });

      if (availabilityForDate.length === 0) return false;

      return checkDayHasAvailableSlot(
        availabilityForDate,
        bookings,
        dayStart,
        dayEnd,
        slotDurationMinutes,
        busyTimes,
      );
    })
    .map((validDate) => format(validDate, "yyyy-MM-dd"));
}

/**
 * Compute available time slots for a specific date.
 * This is a pure function that doesn't fetch any data.
 */
export function computeAvailableSlots(
  availability: AvailabilitySlot[],
  bookings: BookingSlot[],
  date: Date,
  slotDurationMinutes = 30,
  busyTimes: BusyTime[] = [],
): Array<{ start: Date; end: Date }> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const now = new Date();
  const slots: Array<{ start: Date; end: Date }> = [];

  // Find availability blocks for this day
  const availabilityForDate = availability.filter((slot) => {
    const slotStart = parseISO(slot.startDateTime);
    const slotEnd = parseISO(slot.endDateTime);

    return (
      isWithinInterval(slotStart, { start: dayStart, end: dayEnd }) ||
      isWithinInterval(slotEnd, { start: dayStart, end: dayEnd }) ||
      (slotStart <= dayStart && slotEnd >= dayEnd)
    );
  });

  for (const availSlot of availabilityForDate) {
    const availStart = parseISO(availSlot.startDateTime);
    const availEnd = parseISO(availSlot.endDateTime);

    // Clamp to day boundaries
    const slotStart = availStart < dayStart ? dayStart : availStart;
    const slotEnd = availEnd > dayEnd ? dayEnd : availEnd;

    // Generate potential slots
    let currentStart = slotStart;
    while (addMinutes(currentStart, slotDurationMinutes) <= slotEnd) {
      const currentEnd = addMinutes(currentStart, slotDurationMinutes);

      // Skip slots in the past
      if (currentStart < now) {
        currentStart = currentEnd;
        continue;
      }

      // Check if this slot is blocked by a booking
      const hasBookingConflict = bookings.some((booking) => {
        const bookingStart = parseISO(booking.startTime);
        const bookingEnd = parseISO(booking.endTime);
        return currentStart < bookingEnd && currentEnd > bookingStart;
      });

      // Check if this slot is blocked by busy time
      const hasBusyConflict = busyTimes.some((busy) => {
        return currentStart < busy.end && currentEnd > busy.start;
      });

      if (!hasBookingConflict && !hasBusyConflict) {
        slots.push({
          start: new Date(currentStart),
          end: new Date(currentEnd),
        });
      }

      currentStart = currentEnd;
    }
  }

  return slots;
}

/**
 * Check if a specific day has at least one available slot
 */
function checkDayHasAvailableSlot(
  availabilityForDate: AvailabilitySlot[],
  bookings: BookingSlot[],
  dayStart: Date,
  dayEnd: Date,
  slotDurationMinutes: number,
  busyTimes: BusyTime[],
): boolean {
  return availabilityForDate.some((availSlot) => {
    const availStart = parseISO(availSlot.startDateTime);
    const availEnd = parseISO(availSlot.endDateTime);

    const slotRangeStart = availStart < dayStart ? dayStart : availStart;
    const slotRangeEnd = availEnd > dayEnd ? dayEnd : availEnd;

    // Calculate total possible slots in this availability window
    const totalMinutes = differenceInMinutes(slotRangeEnd, slotRangeStart);
    const numberOfSlots = Math.floor(totalMinutes / slotDurationMinutes);

    // Create an array of slot indices and check if any are free
    return Array.from({ length: numberOfSlots }).some((_, index) => {
      const currentStart = addMinutes(
        slotRangeStart,
        index * slotDurationMinutes,
      );
      const currentEnd = addMinutes(currentStart, slotDurationMinutes);

      const hasBookingConflict = bookings.some((booking) => {
        const bookingStart = parseISO(booking.startTime);
        const bookingEnd = parseISO(booking.endTime);
        return currentStart < bookingEnd && currentEnd > bookingStart;
      });

      const hasBusyConflict = busyTimes.some(
        (busy) => currentStart < busy.end && currentEnd > busy.start,
      );

      return !hasBookingConflict && !hasBusyConflict;
    });
  });
}
