import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protege todas as rotas de produtos
router.use(authenticateToken);

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Criar um novo produto
router.post('/', async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    const db = await getDb();

    const result = await db.run(
      'INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)',
      [name, quantity, price]
    );

    res.status(201).json({ id: result.lastID, message: 'Produto criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Atualizar um produto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price } = req.body;
    const db = await getDb();

    await db.run(
      'UPDATE products SET name = ?, quantity = ?, price = ? WHERE id = ?',
      [name, quantity, price, id]
    );

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Adicionar produtos a uma OS (e dar baixa no estoque)
router.post('/os/:osId', async (req, res) => {
  try {
    const { osId } = req.params;
    const { product_id, quantity, price } = req.body;
    const db = await getDb();

    // Inicia uma transação
    await db.run('BEGIN TRANSACTION');

    try {
      // Verifica o estoque
      const product = await db.get('SELECT quantity FROM products WHERE id = ?', [product_id]);
      if (!product || product.quantity < quantity) {
        throw new Error('Estoque insuficiente');
      }

      // Dá baixa no estoque
      await db.run('UPDATE products SET quantity = quantity - ? WHERE id = ?', [quantity, product_id]);

      // Adiciona o produto na OS
      await db.run(
        'INSERT INTO service_order_products (service_order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [osId, product_id, quantity, price]
      );

      // Atualiza o valor total da OS
      await db.run(
        'UPDATE service_orders SET total_value = total_value + ? WHERE id = ?',
        [quantity * price, osId]
      );

      await db.run('COMMIT');
      res.status(201).json({ message: 'Produto adicionado à OS com sucesso' });
    } catch (err: any) {
      await db.run('ROLLBACK');
      res.status(400).json({ error: err.message || 'Erro ao adicionar produto à OS' });
    }
  } catch (error) {
    console.error('Erro na rota de adicionar produto à OS:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
