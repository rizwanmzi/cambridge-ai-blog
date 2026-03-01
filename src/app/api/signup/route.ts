import { NextRequest, NextResponse } from "next/server";

// Validates the access code and returns the appropriate role.
// The actual signUp is done client-side so cookies are set properly.
export async function POST(request: NextRequest) {
  const { email, accessCode } = await request.json();

  if (!email || !accessCode) {
    return NextResponse.json(
      { error: "Email and access code are required" },
      { status: 400 }
    );
  }

  // Admin email gets Admin role regardless of code
  if (email.toLowerCase() === "rizwan.mzi@gmail.com") {
    return NextResponse.json({ role: "Admin" });
  }

  // Determine role from access code
  if (accessCode === process.env.ATTENDEE_CODE) {
    return NextResponse.json({ role: "Attendee" });
  }

  if (accessCode === process.env.OBSERVER_CODE) {
    return NextResponse.json({ role: "Observer" });
  }

  return NextResponse.json(
    { error: "Invalid access code" },
    { status: 403 }
  );
}
