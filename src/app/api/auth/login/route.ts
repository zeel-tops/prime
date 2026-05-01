import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken, JWT_COOKIE } from "@/lib/auth";
import { validateLoginInput } from "@/lib/validation";

const INVALID_CREDENTIALS_MSG = "Invalid email or password";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = body as Record<string, unknown>;

  const errors = validateLoginInput(email, password);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const normalizedEmail = (email as string).trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Always run bcrypt compare to prevent timing-based user enumeration
  const passwordMatches = user
    ? await verifyPassword(password as string, user.password)
    : await verifyPassword(password as string, "$2b$12$invalidhashtopreventtiming000000000000000000000");

  if (!user || !passwordMatches) {
    return NextResponse.json(
      { error: INVALID_CREDENTIALS_MSG },
      { status: 401 }
    );
  }

  const token = await signToken({ sub: user.id, email: user.email });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  });
  response.cookies.set(JWT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
