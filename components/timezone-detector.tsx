"use client";

import Cookies from "js-cookie";
import { useEffect } from "react";

/**
 * Detects the visitor's timezone and stores it in a cookie.
 * Uses js-cookie to handle safe assignment and encoding.
 */
export function TimezoneDetector() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timezone) {
      Cookies.set("timezone", timezone, {
        expires: 365,
        path: "/",
        sameSite: "lax",
      });
    }
  }, []);

  return null;
}
