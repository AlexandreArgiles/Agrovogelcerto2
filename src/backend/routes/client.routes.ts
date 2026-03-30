import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { clientSchema } from '../validators';

const router = Router();
const clientController = new ClientController();

router.use(authMiddleware);

router.get('/', clientController.getAll);
router.post('/', validate(clientSchema), clientController.create);

export default router;
