import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import osRoutes from './os.routes';
import serviceRoutes from './service.routes';
import technicianRoutes from './technician.routes';
import vehicleRoutes from './vehicle.routes';
import userRoutes from './user.routes'; // <-- ADICIONE ESTA LINHA AQUI
import stockRoutes from './stock.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/os', osRoutes);
router.use('/services', serviceRoutes);
router.use('/technicians', technicianRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/users', userRoutes); // <-- AGORA O ERRO VAI SUMIR
router.use('/stock', stockRoutes);

export default router;
