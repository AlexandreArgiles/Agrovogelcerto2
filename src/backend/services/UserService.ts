import db from '../db';
import bcrypt from 'bcryptjs';

export class UserService {
  getAll() {
    const stmt = db.prepare(`
      SELECT
        id,
        name,
        COALESCE(email, username) as email,
        username,
        role,
        active,
        force_password_change,
        created_at
      FROM users
      ORDER BY name ASC
    `);
    return stmt.all();
  }

  getById(id: number) {
    const stmt = db.prepare(`
      SELECT
        id,
        name,
        COALESCE(email, username) as email,
        username,
        role,
        active,
        force_password_change,
        created_at
      FROM users
      WHERE id = ?
    `);
    return stmt.get(id);
  }

  async create(data: { name: string; email: string; role?: string }) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const normalizedEmail = data.email.trim().toLowerCase();
    const usesLegacyUsername = (db.prepare(`PRAGMA table_info(users)`).all() as Array<{ name: string }>)
      .some((column) => column.name === 'username');
    const stmt = usesLegacyUsername
      ? db.prepare(`
          INSERT INTO users (name, email, username, password, role, force_password_change)
          VALUES (?, ?, ?, ?, ?, 1)
        `)
      : db.prepare(`
          INSERT INTO users (name, email, password, role, force_password_change)
          VALUES (?, ?, ?, ?, 1)
        `);
    const info = usesLegacyUsername
      ? stmt.run(data.name.trim(), normalizedEmail, normalizedEmail, hashedPassword, data.role || 'user')
      : stmt.run(data.name.trim(), normalizedEmail, hashedPassword, data.role || 'user');
    return this.getById(info.lastInsertRowid as number);
  }

  async delete(id: number) {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return true;
  }
}
