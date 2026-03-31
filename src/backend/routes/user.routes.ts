import { Router } from 'express';
import { UserService } from '../services/UserService';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const userService = new UserService();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  res.json(await userService.getAll());
});

router.post('/', async (req, res) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: 'Usuario ou e-mail ja existe' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await userService.update(parseInt(req.params.id), req.body);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Nao foi possivel atualizar o usuario' });
  }
});

router.post('/:id/reset-password', async (req, res) => {
  try {
    const { password } = req.body;
    const nextPassword = String(password || '123456').trim();

    if (nextPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha precisa ter pelo menos 6 caracteres' });
    }

    await userService.resetPassword(parseInt(req.params.id), nextPassword);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Nao foi possivel redefinir a senha' });
  }
});

router.delete('/:id', async (req, res) => {
  await userService.delete(parseInt(req.params.id));
  res.status(204).send();
});

export default router;
