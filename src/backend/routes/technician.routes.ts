import { Router } from 'express';
import { TechnicianController } from '../controllers/TechnicianController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const technicianController = new TechnicianController();

// Protege todas as rotas de técnicos para exigir login
router.use(authMiddleware);

router.get('/', technicianController.getAll);
router.get('/:id/payments', technicianController.getPayments);
router.post('/', technicianController.create);
router.post('/:id/payments', technicianController.createPayment);
router.put('/:id', technicianController.update);
router.put('/:id/payments/:paymentId', technicianController.updatePayment);
router.delete('/:id/payments/:paymentId', technicianController.deletePayment);
router.delete('/:id', technicianController.delete);

export default router;
