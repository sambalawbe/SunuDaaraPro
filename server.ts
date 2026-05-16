import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialisation SQLite
  const dbPath = path.join(process.cwd(), 'sama_daara.db');
  const db = new Database(dbPath);

  // Charger le schéma SQL s'il n'existe pas
  const schemaPath = path.join(process.cwd(), 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    try {
      const totalEleves = db.prepare('SELECT COUNT(*) as count FROM eleves').get() as any;
      const totalHafiz = db.prepare('SELECT COUNT(*) as count FROM eleves WHERE niveau_hizb >= 60').get() as any;
      
      res.json({
        totalEleves: totalEleves.count,
        totalHafiz: totalHafiz.count,
        totalEnseignants: 12, // Mock for demo
        caisseMensuelle: 1245000
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur base de données" });
    }
  });

  app.get("/api/eleves", (req, res) => {
    const rows = db.prepare('SELECT * FROM eleves').all();
    res.json(rows);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
