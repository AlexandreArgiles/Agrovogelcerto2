import { Response } from 'express';
import { TechnicianService } from '../services/TechnicianService';
import { AuthRequest } from '../middlewares/auth';

export class TechnicianController {
  private service = new TechnicianService();

  getAll = async (req: AuthRequest, res: Response) => {
    try { res.json(await this.service.getAll()); } catch (error: any) { res.status(500).json({ message: error.message }); }
  };

  create = async (req: AuthRequest, res: Response) => {
    try { res.status(201).json(await this.service.create(req.body)); } catch (error: any) { res.status(400).json({ message: error.message }); }
  };

  update = async (req: AuthRequest, res: Response) => {
    try { res.json(await this.service.update(parseInt(req.params.id), req.body)); } catch (error: any) { res.status(400).json({ message: error.message }); }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try { await this.service.delete(parseInt(req.params.id)); res.status(204).send(); } catch (error: any) { res.status(400).json({ message: error.message }); }
  };
}