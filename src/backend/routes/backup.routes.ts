import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import { BackupService } from '../services/BackupService';

const router = Router();
const backupService = new BackupService();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    res.json({ backups: backupService.listBackups() });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Nao foi possivel listar os backups' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const initiatedBy = req.user?.id ? `user:${req.user.id}` : 'manual';
    const backup = backupService.createBackup('manual', initiatedBy);
    res.status(201).json(backup);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Nao foi possivel criar o backup' });
  }
});

export default router;
