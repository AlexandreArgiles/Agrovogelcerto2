import { Response } from 'express';
import { StockService } from '../services/StockService';
import { AuthRequest } from '../middlewares/auth';

export class StockController {
  private service = new StockService();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      res.json(await this.service.getAll());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  createSection = async (req: AuthRequest, res: Response) => {
    try {
      res.status(201).json(await this.service.createSection(req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  updateSection = async (req: AuthRequest, res: Response) => {
    try {
      res.json(await this.service.updateSection(parseInt(req.params.id), req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deleteSection = async (req: AuthRequest, res: Response) => {
    try {
      await this.service.deleteSection(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  createSubdivision = async (req: AuthRequest, res: Response) => {
    try {
      res.status(201).json(await this.service.createSubdivision(req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  updateSubdivision = async (req: AuthRequest, res: Response) => {
    try {
      res.json(await this.service.updateSubdivision(parseInt(req.params.id), req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deleteSubdivision = async (req: AuthRequest, res: Response) => {
    try {
      await this.service.deleteSubdivision(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  createItem = async (req: AuthRequest, res: Response) => {
    try {
      res.status(201).json(await this.service.createItem(req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  updateItem = async (req: AuthRequest, res: Response) => {
    try {
      res.json(await this.service.updateItem(parseInt(req.params.id), req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deleteItem = async (req: AuthRequest, res: Response) => {
    try {
      await this.service.deleteItem(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
