import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken, JWT_COOKIE } from "@/lib/auth";
import { validateSignupInput } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = body as Record<string, unknown>;

  const errors = validateSignupInput(email, password);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const normalizedEmail = (email as string).trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { errors: [{ field: "email", message: "Email already in use" }] },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password as string);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, password: hashed },
    select: { id: true, email: true, createdAt: true },
  });

  const token = await signToken({ sub: user.id, email: user.email });

  const response = NextResponse.json({ user }, { status: 201 });
  response.cookies.set(JWT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
