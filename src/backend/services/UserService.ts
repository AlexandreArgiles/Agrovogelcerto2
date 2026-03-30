import db from '../db';
import bcrypt from 'bcryptjs';

export class UserService {
  async getAll() {
    return db.prepare(`
      SELECT id, name, username, role, active, force_password_change, created_at 
      FROM users 
      ORDER BY name ASC
    `).all();
  }

  async create(data: any) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const stmt = db.prepare(`
      INSERT INTO users (name, username, password, role, force_password_change) 
      VALUES (?, ?, ?, ?, 1)
    `);
    const info = stmt.run(data.name, data.username, hashedPassword, data.role || 'user');
    return db.prepare('SELECT id, name, username, role FROM users WHERE id = ?').get(info.lastInsertRowid);
  }

  async delete(id: number) {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return true;
  }
}