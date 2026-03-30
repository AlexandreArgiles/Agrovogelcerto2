import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protege todas as rotas de OS
router.use(authenticateToken);

// Listar todas as ordens de serviço
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const osList = await db.all(`
      SELECT so.*, c.name as client_name, u.name as technician_name
      FROM service_orders so
      JOIN clients c ON so.client_id = c.id
      LEFT JOIN users u ON so.technician_id = u.id
    `);
    res.json(osList);
  } catch (error) {
    console.error('Erro ao listar OS:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Criar uma nova OS
router.post('/', async (req, res) => {
  try {
    const { client_id, technician_id, status, description, total_value, payment_status } = req.body;
    const db = await getDb();

    const result = await db.run(
      'INSERT INTO service_orders (client_id, technician_id, status, description, total_value, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, technician_id, status, description, total_value, payment_status]
    );

    res.status(201).json({ id: result.lastID, message: 'OS criada com sucesso' });
  } catch (error) {
    console.error('Erro ao criar OS:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Atualizar uma OS
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id, status, description, total_value, payment_status } = req.body;
    const db = await getDb();

    await db.run(
      'UPDATE service_orders SET technician_id = ?, status = ?, description = ?, total_value = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [technician_id, status, description, total_value, payment_status, id]
    );

    res.json({ message: 'OS atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar OS:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Buscar uma OS específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const os = await db.get(`
      SELECT so.*, c.name as client_name, u.name as technician_name
      FROM service_orders so
      JOIN clients c ON so.client_id = c.id
      LEFT JOIN users u ON so.technician_id = u.id
      WHERE so.id = ?
    `, [id]);
    
    if (!os) {
      return res.status(404).json({ error: 'OS não encontrada' });
    }
    
    res.json(os);
  } catch (error) {
    console.error('Erro ao buscar OS:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
