import { Router } from 'express';
import { OSController } from '../controllers/OSController';
import { authMiddleware } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import { osSchema } from '../validators';

const router = Router();
const osController = new OSController();

router.use(authMiddleware);

router.get('/', osController.getAll);
router.get('/:id', osController.getById);
router.get('/:id/history', osController.getHistory);
router.get('/:id/technicians', osController.getTechnicians);
router.get('/:id/materials', osController.getMaterials);
router.post('/', upload.single('image'), validate(osSchema), osController.create);
router.put('/:id', upload.single('image'), validate(osSchema), osController.update);
router.post('/:id/materials', osController.addMaterial);
router.put('/:id/materials/:materialId', osController.updateMaterial);
router.delete('/:id/materials/:materialId', osController.deleteMaterial);
router.put('/:id/status', osController.updateStatus);
router.delete('/:id', osController.delete);

export default router;
