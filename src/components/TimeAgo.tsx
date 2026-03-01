"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";

export default function TimeAgo({ date }: { date: string }) {
  const [relative, setRelative] = useState<string>("");

  useEffect(() => {
    setRelative(timeAgo(date));
    const interval = setInterval(() => {
      setRelative(timeAgo(date));
    }, 30000);
    return () => clearInterval(interval);
  }, [date]);

  // Server-render the absolute date, client hydrates with relative
  if (!relative) {
    return (
      <time className="text-sm text-txt-secondary" dateTime={date}>
        {new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </time>
    );
  }

  return (
    <time
      className="text-sm text-txt-secondary"
      dateTime={date}
      title={new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    >
      {relative}
    </time>
  );
}
