import db from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey123';

export class AuthService {
  async login(email: string, password: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
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

  async register(name: string, email: string, password: string) {
    const stmtCheck = db.prepare('SELECT * FROM users WHERE email = ?');
    const existing = stmtCheck.get(email);

    if (existing) {
      throw new Error('Email already in use');
    }

    const hash = await bcrypt.hash(password, 10);
    const stmtInsert = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const info = stmtInsert.run(name, email, hash);

    return { id: info.lastInsertRowid, name, email };
  }
}
