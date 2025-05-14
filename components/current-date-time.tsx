"use client";

import { useState, useEffect } from "react";

export function CurrentDateTime() {
  const [dateTime, setDateTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize with current time only on client side
    setDateTime(new Date());

    // Update the date/time every second
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  if (!dateTime) {
    // Return empty div during SSR and initial client render
    return (
      <div className="text-orange-400 font-bold hidden md:flex flex-col items-end mr-4">
        <div className="text-2xl font-mono tracking-wide text-orange-400"></div>
        <div className="text-sm text-orange-300"></div>
      </div>
    );
  }

  // Format date as "DD/MM/YYYY"
  const formattedDate = dateTime.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Format time as "HH:MM:SS"
  const formattedTime = dateTime.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="text-orange-400 font-bold hidden md:flex flex-col items-end mr-4">
      <div className="text-2xl font-mono tracking-wide text-orange-400">
        {formattedTime}
      </div>
      <div className="text-sm text-orange-300">{formattedDate}</div>
    </div>
  );
}
