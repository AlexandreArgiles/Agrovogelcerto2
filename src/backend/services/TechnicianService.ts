import db from '../db';

type TechnicianPayload = {
  name: string;
  phone?: string;
  email?: string;
  pix_key?: string;
  active?: number | boolean;
};

type TechnicianPaymentPayload = {
  amount: number;
  note?: string;
  paid_at?: string;
};

export class TechnicianService {
  private readonly summarySelect = `
    SELECT
      t.*,
      COALESCE((
        SELECT SUM(
          so.final_technician_pay / (
            SELECT COUNT(*) * 1.0
            FROM os_technicians
            WHERE os_id = so.id
          )
        )
        FROM os_technicians ot
        JOIN service_orders so ON ot.os_id = so.id
        WHERE ot.technician_id = t.id
          AND so.status = 'completed'
      ), 0) as total_earned,
      COALESCE((
        SELECT SUM(tp.amount)
        FROM technician_payments tp
        WHERE tp.technician_id = t.id
      ), 0) as total_paid,
      COALESCE((
        SELECT MAX(tp.paid_at)
        FROM technician_payments tp
        WHERE tp.technician_id = t.id
      ), NULL) as last_payment_at
    FROM technicians t
  `;

  private enrichTechnician(technician: any) {
    if (!technician) return null;

    const totalEarned = Number(technician.total_earned || 0);
    const totalPaid = Number(technician.total_paid || 0);

    return {
      ...technician,
      total_earned: totalEarned,
      total_paid: totalPaid,
      balance_due: Math.max(totalEarned - totalPaid, 0)
    };
  }

  async getAll() {
    const technicians = db.prepare(`
      ${this.summarySelect}
      ORDER BY t.name ASC
    `).all();

    return technicians.map((technician) => this.enrichTechnician(technician));
  }

  async getById(id: number) {
    const technician = db.prepare(`
      ${this.summarySelect}
      WHERE t.id = ?
    `).get(id);

    return this.enrichTechnician(technician);
  }

  async getPayments(technicianId: number) {
    return db.prepare(`
      SELECT id, technician_id, amount, note, paid_at, created_at
      FROM technician_payments
      WHERE technician_id = ?
      ORDER BY date(paid_at) DESC, created_at DESC
    `).all(technicianId);
  }

  async create(data: TechnicianPayload) {
    const stmt = db.prepare(`
      INSERT INTO technicians (name, phone, email, pix_key)
      VALUES (?, ?, ?, ?)
    `);

    const info = stmt.run(
      data.name,
      data.phone || null,
      data.email || null,
      data.pix_key || null
    );

    return this.getById(info.lastInsertRowid as number);
  }

  async update(id: number, data: TechnicianPayload) {
    const stmt = db.prepare(`
      UPDATE technicians
      SET name = ?, phone = ?, email = ?, pix_key = ?, active = ?
      WHERE id = ?
    `);

    stmt.run(
      data.name,
      data.phone || null,
      data.email || null,
      data.pix_key || null,
      data.active !== undefined ? Number(data.active) : 1,
      id
    );

    return this.getById(id);
  }

  async createPayment(technicianId: number, data: TechnicianPaymentPayload) {
    const technician = await this.getById(technicianId);

    if (!technician) {
      throw new Error('Tecnico nao encontrado');
    }

    const amount = Number(data.amount || 0);
    if (!amount || amount <= 0) {
      throw new Error('Informe um valor de pagamento valido');
    }

    if (amount - technician.balance_due > 0.01) {
      throw new Error('O pagamento nao pode ser maior que o saldo pendente');
    }

    const paidAt = data.paid_at || new Date().toISOString().slice(0, 10);

    const stmt = db.prepare(`
      INSERT INTO technician_payments (technician_id, amount, note, paid_at)
      VALUES (?, ?, ?, ?)
    `);

    const info = stmt.run(
      technicianId,
      amount,
      data.note || null,
      paidAt
    );

    return db.prepare(`
      SELECT id, technician_id, amount, note, paid_at, created_at
      FROM technician_payments
      WHERE id = ?
    `).get(info.lastInsertRowid as number);
  }

  async updatePayment(technicianId: number, paymentId: number, data: TechnicianPaymentPayload) {
    const technician = await this.getById(technicianId);

    if (!technician) {
      throw new Error('Tecnico nao encontrado');
    }

    const payment = db.prepare(`
      SELECT id, amount
      FROM technician_payments
      WHERE id = ? AND technician_id = ?
    `).get(paymentId, technicianId) as { id: number; amount: number } | undefined;

    if (!payment) {
      throw new Error('Pagamento nao encontrado');
    }

    const amount = Number(data.amount || 0);
    if (!amount || amount <= 0) {
      throw new Error('Informe um valor de pagamento valido');
    }

    const availableBalance = Number(technician.balance_due || 0) + Number(payment.amount || 0);
    if (amount - availableBalance > 0.01) {
      throw new Error('O pagamento atualizado nao pode ser maior que o saldo disponivel');
    }

    const paidAt = data.paid_at || new Date().toISOString().slice(0, 10);

    db.prepare(`
      UPDATE technician_payments
      SET amount = ?, note = ?, paid_at = ?
      WHERE id = ? AND technician_id = ?
    `).run(
      amount,
      data.note || null,
      paidAt,
      paymentId,
      technicianId
    );

    return db.prepare(`
      SELECT id, technician_id, amount, note, paid_at, created_at
      FROM technician_payments
      WHERE id = ?
    `).get(paymentId);
  }

  async deletePayment(technicianId: number, paymentId: number) {
    const payment = db.prepare(`
      SELECT id
      FROM technician_payments
      WHERE id = ? AND technician_id = ?
    `).get(paymentId, technicianId);

    if (!payment) {
      throw new Error('Pagamento nao encontrado');
    }

    db.prepare('DELETE FROM technician_payments WHERE id = ?').run(paymentId);
    return true;
  }

  async delete(id: number) {
    db.prepare('DELETE FROM technician_payments WHERE technician_id = ?').run(id);
    db.prepare('DELETE FROM os_technicians WHERE technician_id = ?').run(id);
    db.prepare('DELETE FROM technicians WHERE id = ?').run(id);
    return true;
  }
}
