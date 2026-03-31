import { Router } from 'express';
import { StockController } from '../controllers/StockController';
import { authMiddleware } from '../middlewares/auth';
import { initDb } from '../db';

const router = Router();
const stockController = new StockController();

router.use(authMiddleware);
router.use(async (_req, _res, next) => {
  await initDb();
  next();
});

router.get('/', stockController.getAll);

router.post('/sections', stockController.createSection);
router.put('/sections/:id', stockController.updateSection);
router.delete('/sections/:id', stockController.deleteSection);

router.post('/subdivisions', stockController.createSubdivision);
router.put('/subdivisions/:id', stockController.updateSubdivision);
router.delete('/subdivisions/:id', stockController.deleteSubdivision);

router.post('/items', stockController.createItem);
router.put('/items/:id', stockController.updateItem);
router.delete('/items/:id', stockController.deleteItem);

export default router;
