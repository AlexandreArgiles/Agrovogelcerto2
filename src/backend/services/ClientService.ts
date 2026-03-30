import db from '../db';

type ClientPayload = {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  latitude?: number;
  longitude?: number;
};

export class ClientService {
  async getAll() {
    const stmt = db.prepare('SELECT * FROM clients ORDER BY name ASC');
    return stmt.all();
  }

  async create(data: ClientPayload, userId: number) {
    const stmt = db.prepare(`
      INSERT INTO clients (name, email, phone, cpf, birth_date, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.name,
      data.email || null,
      data.phone || null,
      data.cpf || null,
      data.birth_date || null,
      data.latitude ?? null,
      data.longitude ?? null
    );

    const clientId = info.lastInsertRowid as number;

    db.prepare('INSERT INTO system_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(userId, 'CREATE', 'clients', clientId, `Created client ${data.name}`);

    return db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  }

  async update(id: number, data: ClientPayload, userId: number) {
    const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Client not found');
    }

    db.prepare(`
      UPDATE clients
      SET name = ?, email = ?, phone = ?, cpf = ?, birth_date = ?, latitude = ?, longitude = ?
      WHERE id = ?
    `).run(
      data.name,
      data.email || null,
      data.phone || null,
      data.cpf || null,
      data.birth_date || null,
      data.latitude ?? null,
      data.longitude ?? null,
      id
    );

    db.prepare('INSERT INTO system_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(userId, 'UPDATE', 'clients', id, `Updated client ${data.name}`);

    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  }

  async delete(id: number, userId: number) {
    const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as { name: string } | undefined;
    if (!existing) {
      throw new Error('Client not found');
    }

    const linkedOrders = db.prepare('SELECT COUNT(*) as total FROM service_orders WHERE client_id = ?').get(id) as { total: number };
    if (linkedOrders.total > 0) {
      throw new Error('Nao e possivel excluir um cliente com ordens de servico vinculadas');
    }

    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    db.prepare('INSERT INTO system_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(userId, 'DELETE', 'clients', id, `Deleted client ${existing.name}`);
    return true;
  }
}
