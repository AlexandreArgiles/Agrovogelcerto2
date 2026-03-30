import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const serviceController = new ServiceController();

router.use(authMiddleware);

router.get('/', serviceController.getAll);
router.post('/', serviceController.create);
router.put('/:id', serviceController.update);
router.delete('/:id', serviceController.delete);

export default router;