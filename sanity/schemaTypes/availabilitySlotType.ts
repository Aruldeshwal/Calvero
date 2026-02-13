import { ClockIcon } from "@sanity/icons";
import type { DatetimeRule } from "sanity";
import { defineField, defineType } from "sanity";

interface PreviewData {
  start?: string;
  end?: string;
}

interface PreviewResult {
  title: string;
  subtitle?: string;
}

export const availabilitySlotType = defineType({
  name: "availabilitySlot",
  title: "Availability Slot",
  type: "object",
  icon: ClockIcon,
  fields: [
    defineField({
      name: "startDateTime",
      title: "Start",
      type: "datetime",
      validation: (Rule: DatetimeRule) => Rule.required(),
    }),
    defineField({
      name: "endDateTime",
      title: "End",
      type: "datetime",
      validation: (Rule: DatetimeRule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      start: "startDateTime",
      end: "endDateTime",
    },
    prepare({ start, end }: PreviewData): PreviewResult {
      if (!start || !end) return { title: "New Slot" };

      const startDate = new Date(start);
      const endDate = new Date(end);

      const dateStr = startDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const startTime = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      const endTime = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      return {
        title: `${dateStr}`,
        subtitle: `${startTime} - ${endTime}`,
      };
    },
  },
});
