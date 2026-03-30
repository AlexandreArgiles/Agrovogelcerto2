import db from '../db';

export class ServiceService {
  async getAll() {
    return db.prepare('SELECT * FROM services ORDER BY name ASC').all();
  }

  async getById(id: number) {
    return db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  }

  async create(data: { name: string; description?: string; price_type: string; price: number; technician_pay: number }) {
    // Aqui adicionamos o technician_pay no INSERT
    const stmt = db.prepare('INSERT INTO services (name, description, price_type, price, technician_pay) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(data.name, data.description || null, data.price_type, data.price, data.technician_pay);
    return this.getById(info.lastInsertRowid as number);
  }

  async update(id: number, data: { name: string; description?: string; price_type: string; price: number; technician_pay: number }) {
    // Aqui adicionamos o technician_pay no UPDATE
    const stmt = db.prepare('UPDATE services SET name = ?, description = ?, price_type = ?, price = ?, technician_pay = ? WHERE id = ?');
    stmt.run(data.name, data.description || null, data.price_type, data.price, data.technician_pay, id);
    return this.getById(id);
  }

  async delete(id: number) {
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    return true;
  }
}