import db from '../db';

export class ServiceService {
  async getAll() {
    return db.prepare('SELECT * FROM services ORDER BY name ASC').all();
  }

  async getById(id: number) {
    return db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  }

  async create(data: { name: string; description?: string; price_type: string; price: number; technician_pay: number; billing_party?: string; payer_name?: string }) {
    const stmt = db.prepare(`
      INSERT INTO services (name, description, price_type, price, technician_pay, billing_party, payer_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.name,
      data.description || null,
      data.price_type,
      data.price,
      data.technician_pay,
      data.billing_party || 'client',
      data.billing_party === 'partner' ? (data.payer_name || null) : null
    );
    return this.getById(info.lastInsertRowid as number);
  }

  async update(id: number, data: { name: string; description?: string; price_type: string; price: number; technician_pay: number; billing_party?: string; payer_name?: string }) {
    const stmt = db.prepare(`
      UPDATE services
      SET name = ?, description = ?, price_type = ?, price = ?, technician_pay = ?, billing_party = ?, payer_name = ?
      WHERE id = ?
    `);
    stmt.run(
      data.name,
      data.description || null,
      data.price_type,
      data.price,
      data.technician_pay,
      data.billing_party || 'client',
      data.billing_party === 'partner' ? (data.payer_name || null) : null,
      id
    );
    return this.getById(id);
  }

  async delete(id: number) {
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    return true;
  }
}
