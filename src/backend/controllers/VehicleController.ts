import { Response } from 'express';
import { VehicleService } from '../services/VehicleService';
import { AuthRequest } from '../middlewares/auth';

export class VehicleController {
  private service = new VehicleService();
  getAll = async (req: AuthRequest, res: Response) => { res.json(await this.service.getAll()); };
  getExpenses = async (req: AuthRequest, res: Response) => { res.json(await this.service.getExpenses()); };
  create = async (req: AuthRequest, res: Response) => { res.status(201).json(await this.service.create(req.body)); };
  createExpense = async (req: AuthRequest, res: Response) => { res.status(201).json(await this.service.createExpense(req.body)); };
  update = async (req: AuthRequest, res: Response) => { res.json(await this.service.update(parseInt(req.params.id), req.body)); };
  delete = async (req: AuthRequest, res: Response) => { await this.service.delete(parseInt(req.params.id)); res.status(204).send(); };
  deleteExpense = async (req: AuthRequest, res: Response) => { await this.service.deleteExpense(parseInt(req.params.id)); res.status(204).send(); };
}