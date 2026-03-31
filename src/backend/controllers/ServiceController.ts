import { Response } from 'express';
import { ServiceService } from '../services/ServiceService';
import { AuthRequest } from '../middlewares/auth';

export class ServiceController {
  private serviceService = new ServiceService();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const services = await this.serviceService.getAll();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, price_type, price, technician_pay, billing_party, payer_name } = req.body;

      const newService = await this.serviceService.create({
        name,
        description,
        price_type,
        price,
        technician_pay,
        billing_party,
        payer_name
      });

      res.status(201).json(newService);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, price_type, price, technician_pay, billing_party, payer_name } = req.body;

      const updatedService = await this.serviceService.update(id, {
        name,
        description,
        price_type,
        price,
        technician_pay,
        billing_party,
        payer_name
      });

      res.json(updatedService);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await this.serviceService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
