import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.join(process.cwd(), "client", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      Could not find client build directory: ${distPath}. Make sure to build the client first.
    );
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
