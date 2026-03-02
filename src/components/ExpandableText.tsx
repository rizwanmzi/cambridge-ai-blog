"use client";

import { useState } from "react";

export default function ExpandableText({
  text,
  limit = 300,
  className = "",
}: {
  text: string;
  limit?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= limit) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {expanded ? text : `${text.slice(0, limit).trimEnd()}…`}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="ml-1 text-emerald-400/80 hover:text-emerald-400 text-[12px] font-medium transition-colors duration-200"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </span>
  );
}
