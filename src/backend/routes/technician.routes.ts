import { Router } from 'express';
import { TechnicianController } from '../controllers/TechnicianController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const technicianController = new TechnicianController();

// Protege todas as rotas de técnicos para exigir login
router.use(authMiddleware);

router.get('/', technicianController.getAll);
router.post('/', technicianController.create);
router.put('/:id', technicianController.update);
router.delete('/:id', technicianController.delete);

export default router;