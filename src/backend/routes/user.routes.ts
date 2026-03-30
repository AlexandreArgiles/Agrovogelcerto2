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

router.delete('/:id', async (req, res) => {
  await userService.delete(parseInt(req.params.id));
  res.status(204).send();
});

export default router;
