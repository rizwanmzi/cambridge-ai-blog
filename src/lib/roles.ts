export const roleBadgeColors: Record<string, string> = {
  Admin: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  Attendee: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  Observer: "bg-slate-500/20 text-slate-400 border-slate-500/40",
};

export function canPost(role: string | undefined): boolean {
  return role === "Admin" || role === "Attendee";
}
