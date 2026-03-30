import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o banco de dados (na raiz do projeto para facilitar)
const dbPath = path.resolve(__dirname, '../../database.sqlite');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  return dbInstance;
}

export async function initDb() {
  const db = await getDb();

  // Criação das tabelas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'technician'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      history TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      technician_id INTEGER,
      status TEXT NOT NULL CHECK(status IN ('Aberta', 'Em andamento', 'Aguardando peça', 'Finalizada')),
      description TEXT NOT NULL,
      total_value REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'Pendente' CHECK(payment_status IN ('Pendente', 'Pago')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (technician_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS service_order_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (service_order_id) REFERENCES service_orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Inserir um admin padrão se não existir
  const adminExists = await db.get('SELECT id FROM users WHERE email = ?', ['admin@agrovogel.com']);
  if (!adminExists) {
    // Senha padrão: admin123 (hash gerado com bcrypt)
    // bcrypt.hashSync('admin123', 10)
    const defaultPasswordHash = '$2a$10$wT8v/8n.L9.z/7.Z.Z.Z.e.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z'; // Vou gerar um hash real no controller de auth ou aqui
    // Para simplificar, vou usar um hash real de 'admin123'
    const bcrypt = await import('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    
    await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Administrador', 'admin@agrovogel.com', hash, 'admin']
    );
    console.log('Usuário administrador padrão criado. Email: admin@agrovogel.com / Senha: admin123');
  }
}
