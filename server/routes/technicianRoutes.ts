import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protege todas as rotas de técnicos
router.use(authenticateToken);

// Listar todos os técnicos
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const technicians = await db.all('SELECT id, name, email FROM users WHERE role = "technician"');
    res.json(technicians);
  } catch (error) {
    console.error('Erro ao listar técnicos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Buscar um técnico específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const technician = await db.get('SELECT id, name, email FROM users WHERE id = ? AND role = "technician"', [id]);
    
    if (!technician) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    res.json(technician);
  } catch (error) {
    console.error('Erro ao buscar técnico:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
