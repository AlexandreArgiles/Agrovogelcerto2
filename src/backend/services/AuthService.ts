import db from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey123';

export class AuthService {
  async login(email: string, password: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(COALESCE(email, username)) = LOWER(?)');
    const user = stmt.get(email) as any;

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, force_password_change: user.force_password_change }, 
      SECRET_KEY, 
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        force_password_change: !!user.force_password_change
      }
    };
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(userId) as any;

    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) throw new Error('Incorrect current password');

    const hash = await bcrypt.hash(newPass, 10);
    db.prepare('UPDATE users SET password = ?, force_password_change = 0 WHERE id = ?').run(hash, userId);
    
    // Generate a new token with force_password_change = false
    const token = jwt.sign(
      { id: user.id, role: user.role, force_password_change: false }, 
      SECRET_KEY, 
      { expiresIn: '8h' }
    );

    return { success: true, token };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(COALESCE(email, username)) = LOWER(?)').get(normalizedEmail) as any;

    if (!user) {
      throw new Error('Nenhum usuario encontrado com esse e-mail');
    }

    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
    const hash = await bcrypt.hash(tempPassword, 10);

    db.prepare(`
      UPDATE users
      SET password = ?, force_password_change = 1
      WHERE id = ?
    `).run(hash, user.id);

    return {
      success: true,
      tempPassword,
      userName: user.name
    };
  }

  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const stmtCheck = db.prepare('SELECT * FROM users WHERE LOWER(COALESCE(email, username)) = LOWER(?)');
    const existing = stmtCheck.get(normalizedEmail);

    if (existing) {
      throw new Error('Email already in use');
    }

    const hash = await bcrypt.hash(password, 10);
    const hasUsernameColumn = (db.prepare(`PRAGMA table_info(users)`).all() as Array<{ name: string }>)
      .some((column) => column.name === 'username');
    const stmtInsert = hasUsernameColumn
      ? db.prepare('INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)')
      : db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const info = hasUsernameColumn
      ? stmtInsert.run(name, normalizedEmail, normalizedEmail, hash)
      : stmtInsert.run(name, normalizedEmail, hash);

    return { id: info.lastInsertRowid, name, email: normalizedEmail };
  }
}
