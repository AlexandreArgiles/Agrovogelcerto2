import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

async function seedAdmin() {
  console.log('Iniciando criacao/atualizacao do usuario admin');

  const email = 'admin@agrovogel.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        active INTEGER DEFAULT 1,
        force_password_change INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const stmt = db.prepare(`
      INSERT INTO users (name, email, username, password, role, force_password_change)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        username = excluded.username,
        password = excluded.password,
        role = excluded.role,
        active = 1
    `);

    stmt.run('Administrador Geral', email, email, hashedPassword, 'admin', 0);

    console.log('Admin criado ou atualizado com sucesso');
    console.log(`Login: ${email}`);
    console.log(`Senha: ${password}`);
  } catch (error) {
    console.error('Erro no processo:', error);
  } finally {
    db.close();
  }
}

seedAdmin();
