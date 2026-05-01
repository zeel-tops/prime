import express from "express";
import { initDb } from "./db/database";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());

  app.use("/auth", authRoutes);
  app.use("/api", protectedRoutes);

  return app;
}

if (require.main === module) {
  const dbPath = process.env.DB_PATH ?? "./data/auth.db";
  initDb(dbPath);

  const app = createApp();
  const port = Number(process.env.PORT ?? 3000);

  app.listen(port, () => {
    console.log(`Auth service listening on port ${port}`);
  });
}
