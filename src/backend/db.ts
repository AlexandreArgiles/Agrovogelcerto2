import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

export async function initDb() {
  // Usuários
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, role TEXT DEFAULT 'user', active INTEGER DEFAULT 1,
    force_password_change INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Clientes
  db.exec(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT,
    address TEXT, latitude REAL, longitude REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Serviços
  db.exec(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL,
    technician_pay REAL NOT NULL, price_type TEXT DEFAULT 'fixed', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Técnicos
  db.exec(`CREATE TABLE IF NOT EXISTS technicians (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT,
    active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Veículos
  db.exec(`CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, plate TEXT,
    consumption REAL DEFAULT 10, fuel_price REAL DEFAULT 5.50, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Ordens de Serviço (OS)
  db.exec(`CREATE TABLE IF NOT EXISTS service_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, service_id INTEGER,
    extra_service_id INTEGER, vehicle_id INTEGER, description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', image_url TEXT, latitude REAL, longitude REAL,
    mileage REAL DEFAULT 0, hours_worked REAL DEFAULT 0, travel_cost REAL DEFAULT 0,
    final_price REAL DEFAULT 0, final_technician_pay REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(service_id) REFERENCES services(id),
    FOREIGN KEY(extra_service_id) REFERENCES services(id),
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  )`);

  // Vínculos e Gastos
  db.exec(`CREATE TABLE IF NOT EXISTS os_technicians (
    os_id INTEGER, technician_id INTEGER, PRIMARY KEY (os_id, technician_id),
    FOREIGN KEY(os_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY(technician_id) REFERENCES technicians(id) ON DELETE CASCADE
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS vehicle_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id INTEGER, description TEXT NOT NULL,
    amount REAL NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  )`);

  console.log('✅ Banco de dados AgroVogel pronto.');
}
export default db;