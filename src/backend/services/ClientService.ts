import db from '../db';

export class ClientService {
  async getAll() {
    const stmt = db.prepare('SELECT * FROM clients ORDER BY name ASC');
    return stmt.all();
  }

  async create(data: { name: string; email?: string; phone?: string; latitude?: number; longitude?: number }, userId: number) {
    const stmt = db.prepare(`
      INSERT INTO clients (name, email, phone, latitude, longitude)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(data.name, data.email || null, data.phone || null, data.latitude || null, data.longitude || null);
    
    const clientId = info.lastInsertRowid;
    
    db.prepare('INSERT INTO system_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(userId, 'CREATE', 'clients', clientId, `Created client ${data.name}`);

    const getStmt = db.prepare('SELECT * FROM clients WHERE id = ?');
    return getStmt.get(clientId);
  }
}
