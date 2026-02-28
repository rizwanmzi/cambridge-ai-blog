import { roleBadgeColors } from "@/lib/roles";

export default function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
        roleBadgeColors[role] || "bg-gray-100 text-gray-600 border-gray-300"
      }`}
    >
      {role}
    </span>
  );
}
