import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../auth/password";
import {
  createUser,
  findUserByEmail,
  revokeToken,
  isTokenRevoked,
} from "../db/database";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
}

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

// POST /auth/signup
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  if (findUserByEmail(email)) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = createUser(email, passwordHash);

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "1h" }
  );

  res.status(201).json({ token });
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "1h" }
  );

  res.json({ token });
});

// POST /auth/logout
router.post("/logout", (req: Request, res: Response): void => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Authorization token required" });
    return;
  }

  try {
    jwt.verify(token, getJwtSecret());
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  if (isTokenRevoked(token)) {
    res.status(401).json({ error: "Token already revoked" });
    return;
  }

  revokeToken(token);
  res.json({ message: "Logged out successfully" });
});

export default router;
