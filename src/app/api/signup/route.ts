import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { email, password, username, accessCode } = await request.json();

  if (!email || !password || !username || !accessCode) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  // Determine role from access code
  let role: string;
  if (accessCode === process.env.ATTENDEE_CODE) {
    role = "Attendee";
  } else if (accessCode === process.env.OBSERVER_CODE) {
    role = "Observer";
  } else {
    return NextResponse.json(
      { error: "Invalid access code" },
      { status: 403 }
    );
  }

  // Override role for admin email
  if (email.toLowerCase() === "rizwan.mzi@gmail.com") {
    role = "Admin";
  }

  // Use service-role or anon client for signup
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        username: username.trim(),
        role,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    user: data.user,
    message: "Account created successfully",
  });
}
