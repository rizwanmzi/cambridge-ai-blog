export const roleBadgeColors: Record<string, string> = {
  Admin: "bg-amber-100 text-amber-800 border-amber-300",
  Attendee: "bg-blue-100 text-blue-800 border-blue-300",
  Observer: "bg-gray-100 text-gray-600 border-gray-300",
};

export function canPost(role: string | undefined): boolean {
  return role === "Admin" || role === "Attendee";
}
