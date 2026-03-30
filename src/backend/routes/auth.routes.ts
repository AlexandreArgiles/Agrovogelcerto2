import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import { loginSchema, changePasswordSchema } from '../validators';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', authController.register);
router.post('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);

export default router;
