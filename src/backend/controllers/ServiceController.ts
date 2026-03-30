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
      // Extraindo o technician_pay do corpo da requisição
      const { name, description, price_type, price, technician_pay } = req.body;
      
      const newService = await this.serviceService.create({ 
        name, 
        description, 
        price_type, 
        price, 
        technician_pay 
      });
      res.status(201).json(newService);
    } catch (error: any) { 
      res.status(400).json({ message: error.message }); 
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      // Extraindo o technician_pay na edição também
      const { name, description, price_type, price, technician_pay } = req.body;
      
      const updatedService = await this.serviceService.update(id, { 
        name, 
        description, 
        price_type, 
        price, 
        technician_pay 
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