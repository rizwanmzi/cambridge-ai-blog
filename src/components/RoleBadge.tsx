import { roleBadgeColors } from "@/lib/roles";

export default function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`text-[11px] ${roleBadgeColors[role] || "text-[rgba(255,255,255,0.3)]"}`}>
      {role}
    </span>
  );
}
