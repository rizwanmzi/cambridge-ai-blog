export const roleBadgeColors: Record<string, string> = {
  Admin: "border-amber-500/30 text-amber-400",
  Attendee: "border-blue-500/30 text-blue-400",
  Observer: "border-slate-500/30 text-slate-400",
};

export function canPost(role: string | undefined): boolean {
  return role === "Admin" || role === "Attendee";
}
