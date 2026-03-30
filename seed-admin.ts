import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

async function seedAdmin() {
  console.log('--- Iniciando Reset e Criação de Tabela ---');
  
  const username = 'admin';
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // 1. GARANTE QUE A TABELA EXISTE (O segredo está aqui)
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        active INTEGER DEFAULT 1,
        force_password_change INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Remove o admin antigo se houver
    db.prepare('DELETE FROM users WHERE username = ?').run(username);

    // 3. Insere o novo admin
    const stmt = db.prepare(`
      INSERT INTO users (name, username, password, role, force_password_change) 
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run('Administrador Geral', username, hashedPassword, 'admin', 0);

    console.log('✅ Tabela verificada e usuário ADMIN criado com sucesso!');
    console.log(`👤 Login: ${username}`);
    console.log(`🔑 Senha: ${password}`);
    
  } catch (error) {
    console.error('❌ Erro no processo:', error);
  } finally {
    db.close();
  }
}

seedAdmin();