import { Router, Request, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/me — returns the authenticated user's profile
router.get("/me", requireAuth, (req: Request, res: Response): void => {
  const { user } = req as AuthenticatedRequest;
  res.json({ id: user.sub, email: user.email });
});

export default router;
