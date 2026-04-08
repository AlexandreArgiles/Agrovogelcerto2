import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './src/backend/routes';
import { initDb } from './src/backend/db';
import fs from 'fs';
import { BackupService } from './src/backend/services/BackupService';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production' || path.basename(process.argv[1] || '') === 'server.cjs';
  const backupService = new BackupService();

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  backupService.ensureBackupDir();

  // Initialize Database
  await initDb();
  backupService.runWeeklyBackupIfDue();

  const backupCheckInterval = 6 * 60 * 60 * 1000;
  setInterval(() => {
    try {
      backupService.runWeeklyBackupIfDue();
    } catch (error) {
      console.error('Erro ao verificar backup semanal:', error);
    }
  }, backupCheckInterval);

  app.use(cors());
  app.use(express.json());
  
  // Serve static uploads
  app.use('/uploads', express.static(uploadsDir));

  // API Routes
  app.use('/api', routes);

  // Vite middleware for development
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
