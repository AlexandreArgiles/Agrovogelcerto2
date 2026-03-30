import { Response } from 'express';
import { ClientService } from '../services/ClientService';
import { AuthRequest } from '../middlewares/auth';

export class ClientController {
  private clientService = new ClientService();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const clients = await this.clientService.getAll();
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, phone, cpf, birth_date, latitude, longitude } = req.body;
      const userId = req.user!.id;
      const newClient = await this.clientService.create({
        name,
        email,
        phone,
        cpf,
        birth_date,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined
      }, userId);
      res.status(201).json(newClient);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, email, phone, cpf, birth_date, latitude, longitude } = req.body;
      const userId = req.user!.id;
      const updatedClient = await this.clientService.update(id, {
        name,
        email,
        phone,
        cpf,
        birth_date,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined
      }, userId);
      res.json(updatedClient);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      await this.clientService.delete(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
