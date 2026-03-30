import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

function hasColumn(tableName: string, columnName: string) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return columns.some((column) => column.name === columnName);
}

export async function initDb() {
  db.pragma('foreign_keys = ON');

  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    active INTEGER DEFAULT 1,
    force_password_change INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    cpf TEXT,
    birth_date TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0,
    technician_pay REAL NOT NULL DEFAULT 0,
    price_type TEXT DEFAULT 'fixed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS technicians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    plate TEXT,
    consumption REAL DEFAULT 10,
    fuel_price REAL DEFAULT 5.50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS service_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    service_id INTEGER,
    extra_service_id INTEGER,
    vehicle_id INTEGER,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    image_url TEXT,
    latitude REAL,
    longitude REAL,
    mileage REAL DEFAULT 0,
    hours_worked REAL DEFAULT 0,
    travel_cost REAL DEFAULT 0,
    final_price REAL DEFAULT 0,
    final_technician_pay REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(service_id) REFERENCES services(id),
    FOREIGN KEY(extra_service_id) REFERENCES services(id),
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS os_technicians (
    os_id INTEGER,
    technician_id INTEGER,
    PRIMARY KEY (os_id, technician_id),
    FOREIGN KEY(os_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY(technician_id) REFERENCES technicians(id) ON DELETE CASCADE
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS os_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    os_id INTEGER NOT NULL,
    user_id INTEGER,
    previous_status TEXT,
    new_status TEXT,
    changes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(os_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS vehicle_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);

  if (!hasColumn('services', 'description')) {
    db.exec('ALTER TABLE services ADD COLUMN description TEXT');
  }

  if (!hasColumn('clients', 'cpf')) {
    db.exec('ALTER TABLE clients ADD COLUMN cpf TEXT');
  }

  if (!hasColumn('clients', 'birth_date')) {
    db.exec('ALTER TABLE clients ADD COLUMN birth_date TEXT');
  }

  if (!hasColumn('users', 'active')) {
    db.exec('ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1');
  }

  if (!hasColumn('users', 'force_password_change')) {
    db.exec('ALTER TABLE users ADD COLUMN force_password_change INTEGER DEFAULT 0');
  }

  if (!hasColumn('users', 'email')) {
    db.exec('ALTER TABLE users ADD COLUMN email TEXT');
  }

  if (!hasColumn('users', 'username')) {
    db.exec('ALTER TABLE users ADD COLUMN username TEXT');
  }

  db.exec(`
    UPDATE users
    SET email = COALESCE(email, username)
    WHERE email IS NULL OR TRIM(email) = ''
  `);

  db.exec(`
    UPDATE users
    SET username = COALESCE(username, email)
    WHERE username IS NULL OR TRIM(username) = ''
  `);

  console.log('Banco de dados AgroVogel pronto.');
}

export default db;
