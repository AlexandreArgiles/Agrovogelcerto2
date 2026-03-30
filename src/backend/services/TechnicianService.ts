import db from '../db';

export class TechnicianService {
  async getAll() {
    // Calcula automaticamente o total ganho (dividindo a comissão pelo número de técnicos na OS)
    return db.prepare(`
      SELECT t.*, 
        COALESCE((
          SELECT SUM(so.final_technician_pay / (SELECT COUNT(*) * 1.0 FROM os_technicians WHERE os_id = so.id))
          FROM os_technicians ot
          JOIN service_orders so ON ot.os_id = so.id
          WHERE ot.technician_id = t.id AND so.status = 'completed'
        ), 0) as total_earned
      FROM technicians t
      ORDER BY t.name ASC
    `).all();
  }

  async getById(id: number) {
    return db.prepare(`
      SELECT t.*, 
        COALESCE((
          SELECT SUM(so.final_technician_pay / (SELECT COUNT(*) * 1.0 FROM os_technicians WHERE os_id = so.id))
          FROM os_technicians ot
          JOIN service_orders so ON ot.os_id = so.id
          WHERE ot.technician_id = t.id AND so.status = 'completed'
        ), 0) as total_earned
      FROM technicians t
      WHERE t.id = ?
    `).get(id);
  }

  async create(data: { name: string; phone?: string; email?: string }) {
    const stmt = db.prepare('INSERT INTO technicians (name, phone, email) VALUES (?, ?, ?)');
    const info = stmt.run(data.name, data.phone || null, data.email || null);
    return this.getById(info.lastInsertRowid as number);
  }

  async update(id: number, data: any) {
    const stmt = db.prepare('UPDATE technicians SET name = ?, phone = ?, email = ?, active = ? WHERE id = ?');
    stmt.run(data.name, data.phone, data.email, data.active !== undefined ? data.active : 1, id);
    return this.getById(id);
  }

  async delete(id: number) {
    db.prepare('DELETE FROM os_technicians WHERE technician_id = ?').run(id);
    db.prepare('DELETE FROM technicians WHERE id = ?').run(id);
    return true;
  }
}