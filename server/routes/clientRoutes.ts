import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protege todas as rotas de clientes
router.use(authenticateToken);

// Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const clients = await db.all('SELECT * FROM clients');
    res.json(clients);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Criar um novo cliente
router.post('/', async (req, res) => {
  try {
    const { name, phone, address, latitude, longitude, history } = req.body;
    const db = await getDb();

    const result = await db.run(
      'INSERT INTO clients (name, phone, address, latitude, longitude, history) VALUES (?, ?, ?, ?, ?, ?)',
      [name, phone, address, latitude, longitude, history]
    );

    res.status(201).json({ id: result.lastID, message: 'Cliente criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Atualizar um cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, latitude, longitude, history } = req.body;
    const db = await getDb();

    await db.run(
      'UPDATE clients SET name = ?, phone = ?, address = ?, latitude = ?, longitude = ?, history = ? WHERE id = ?',
      [name, phone, address, latitude, longitude, history, id]
    );

    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Buscar um cliente específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const client = await db.get('SELECT * FROM clients WHERE id = ?', [id]);
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
