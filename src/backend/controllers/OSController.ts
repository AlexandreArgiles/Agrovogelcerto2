import { Response } from 'express';
import { OSService } from '../services/OSService';
import { AuthRequest } from '../middlewares/auth';

export class OSController {
  private osService = new OSService();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const orders = await this.osService.getAll();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await this.osService.getById(id);
      if (!order) return res.status(404).json({ message: 'OS not found' });
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getHistory = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const history = await this.osService.getHistory(id);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getTechnicians = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const technicians = await this.osService.getTechniciansByOs(id);
      res.json(technicians || []);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { client_id, service_id, extra_service_id, vehicle_id, technician_ids, description, latitude, longitude, mileage, travel_cost } = req.body;
      const userId = req.user!.id;
      
      const newOS = await this.osService.create({
        client_id: parseInt(client_id),
        service_id: service_id ? parseInt(service_id) : undefined,
        extra_service_id: extra_service_id ? parseInt(extra_service_id) : undefined,
        vehicle_id: vehicle_id ? parseInt(vehicle_id) : undefined,
        technician_ids: technician_ids ? (typeof technician_ids === 'string' ? JSON.parse(technician_ids) : technician_ids) : [],
        description,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        mileage: mileage ? parseFloat(mileage) : 0,
        travel_cost: travel_cost ? parseFloat(travel_cost) : 0,
      }, req.file, userId);
      
      res.status(201).json(newOS);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { service_id, extra_service_id, vehicle_id, technician_ids, description, status, latitude, longitude, mileage, hours_worked, travel_cost, final_price, final_technician_pay } = req.body;
      const userId = req.user!.id;

      const updatedOS = await this.osService.update(id, {
        service_id: service_id ? parseInt(service_id) : (service_id === '' ? null : undefined),
        extra_service_id: extra_service_id ? parseInt(extra_service_id) : (extra_service_id === '' ? null : undefined),
        vehicle_id: vehicle_id ? parseInt(vehicle_id) : (vehicle_id === '' ? null : undefined),
        technician_ids: technician_ids ? (typeof technician_ids === 'string' ? JSON.parse(technician_ids) : technician_ids) : undefined,
        description,
        status,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        mileage: mileage !== undefined && mileage !== '' ? parseFloat(mileage) : undefined,
        hours_worked: hours_worked !== undefined && hours_worked !== '' ? parseFloat(hours_worked) : undefined,
        travel_cost: travel_cost !== undefined && travel_cost !== '' ? parseFloat(travel_cost) : undefined,
        final_price: final_price !== undefined && final_price !== '' ? parseFloat(final_price) : undefined,
        final_technician_pay: final_technician_pay !== undefined && final_technician_pay !== '' ? parseFloat(final_technician_pay) : undefined,
      }, req.file, userId);
      
      res.json(updatedOS);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  updateStatus = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user!.id;
      
      const updatedOS = await this.osService.updateStatus(id, status, userId);
      res.json(updatedOS);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      await this.osService.delete(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}