import db from '../db';
export class VehicleService {
  async getAll() { return db.prepare('SELECT * FROM vehicles ORDER BY name ASC').all(); }
  async getExpenses() { return db.prepare('SELECT ve.*, v.name as vehicle_name FROM vehicle_expenses ve JOIN vehicles v ON ve.vehicle_id = v.id ORDER BY ve.created_at DESC').all(); }
  async create(data: any) {
    const info = db.prepare('INSERT INTO vehicles (name, plate, consumption, fuel_price) VALUES (?, ?, ?, ?)').run(
      data.name,
      data.plate || null,
      Number(data.consumption) || 0,
      Number(data.fuel_price) || 0
    );
    return db.prepare('SELECT * FROM vehicles WHERE id = ?').get(info.lastInsertRowid);
  }
  async createExpense(data: any) {
    const info = db.prepare('INSERT INTO vehicle_expenses (vehicle_id, description, amount) VALUES (?, ?, ?)').run(
      Number(data.vehicle_id),
      data.description,
      Number(data.amount) || 0
    );
    return { id: info.lastInsertRowid };
  }
  async update(id: number, data: any) {
    db.prepare('UPDATE vehicles SET name=?, plate=?, consumption=?, fuel_price=? WHERE id=?').run(
      data.name,
      data.plate || null,
      Number(data.consumption) || 0,
      Number(data.fuel_price) || 0,
      id
    );
    return db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
  }
  async delete(id: number) { db.prepare('DELETE FROM vehicles WHERE id = ?').run(id); return true; }
  async deleteExpense(id: number) { db.prepare('DELETE FROM vehicle_expenses WHERE id = ?').run(id); return true; }
}
