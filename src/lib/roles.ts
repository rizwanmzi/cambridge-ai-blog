export const roleBadgeColors: Record<string, string> = {
  Admin: "text-amber-400/70",
  Attendee: "text-blue-400/70",
  Observer: "text-[rgba(255,255,255,0.35)]",
};

export function canPost(role: string | undefined): boolean {
  return role === "Admin" || role === "Attendee";
}
