import db from '../db';

export class OSService {
  async getAll() {
    return db.prepare(`
      SELECT so.*, 
             c.name as client_name, 
             c.latitude as client_latitude,
             c.longitude as client_longitude,
             s.name as service_name, 
             es.name as extra_service_name,
             v.name as vehicle_name,
             (SELECT COUNT(*) FROM os_technicians WHERE os_id = so.id) as technician_count
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      LEFT JOIN services s ON so.service_id = s.id
      LEFT JOIN services es ON so.extra_service_id = es.id
      LEFT JOIN vehicles v ON so.vehicle_id = v.id
      ORDER BY so.created_at DESC
    `).all();
  }

  async getById(id: number) {
    return db.prepare(`
      SELECT so.*, 
             c.name as client_name, 
             c.latitude as client_latitude,
             c.longitude as client_longitude,
             s.name as service_name, 
             es.name as extra_service_name,
             v.name as vehicle_name,
             (SELECT COUNT(*) FROM os_technicians WHERE os_id = so.id) as technician_count
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      LEFT JOIN services s ON so.service_id = s.id
      LEFT JOIN services es ON so.extra_service_id = es.id
      LEFT JOIN vehicles v ON so.vehicle_id = v.id
      WHERE so.id = ?
    `).get(id);
  }

  async getHistory(id: number) {
    return db.prepare(`
      SELECT oh.*, u.name as user_name 
      FROM os_history oh 
      LEFT JOIN users u ON oh.user_id = u.id 
      WHERE oh.os_id = ? 
      ORDER BY oh.created_at DESC
    `).all(id);
  }

  async getTechniciansByOs(osId: number) {
    return db.prepare(`
      SELECT t.* FROM technicians t
      JOIN os_technicians ot ON t.id = ot.technician_id
      WHERE ot.os_id = ?
    `).all(osId);
  }

  async getMaterialsByOs(osId: number) {
    return db.prepare(`
      SELECT
        som.*,
        ii.sku,
        ii.quantity as current_stock_quantity,
        isd.name as subdivision_name,
        ise.name as section_name
      FROM service_order_materials som
      JOIN inventory_items ii ON ii.id = som.inventory_item_id
      LEFT JOIN inventory_subdivisions isd ON isd.id = ii.subdivision_id
      LEFT JOIN inventory_sections ise ON ise.id = isd.section_id
      WHERE som.os_id = ?
      ORDER BY som.created_at DESC, som.id DESC
    `).all(osId);
  }

  async create(data: any, file: any, userId: number) {
    const imageUrl = file ? `/uploads/${file.filename}` : null;
    
    const stmt = db.prepare(`
      INSERT INTO service_orders (
        client_id, service_id, extra_service_id, vehicle_id, description, 
        latitude, longitude, mileage, hours_worked, travel_cost, final_price, final_technician_pay, image_url
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      data.client_id, 
      data.service_id || null, 
      data.extra_service_id || null, 
      data.vehicle_id || null,
      data.description, 
      data.latitude || null, 
      data.longitude || null, 
      data.mileage || 0, 
      data.hours_worked || 0, 
      data.travel_cost || 0,
      data.final_price || 0, 
      data.final_technician_pay || 0, 
      imageUrl
    );
    
    const newOsId = info.lastInsertRowid as number;
    db.prepare('INSERT INTO os_history (os_id, user_id, new_status, changes) VALUES (?, ?, ?, ?)').run(newOsId, userId, 'pending', 'OS Criada');
    
    if (data.technician_ids && Array.isArray(data.technician_ids)) {
      const stmtTech = db.prepare('INSERT INTO os_technicians (os_id, technician_id) VALUES (?, ?)');
      data.technician_ids.forEach((tId: number) => stmtTech.run(newOsId, tId));
    }

    return this.getById(newOsId);
  }

  async update(id: number, data: any, file: any, userId: number) {
    const currentOs = this.getById(id) as any;
    if (!currentOs) throw new Error('OS not found');

    let imageUrl = currentOs.image_url;
    if (file) imageUrl = `/uploads/${file.filename}`;

    const stmt = db.prepare(`
      UPDATE service_orders 
      SET service_id = ?, extra_service_id = ?, vehicle_id = ?, description = ?, status = ?, 
          latitude = ?, longitude = ?, mileage = ?, hours_worked = ?, travel_cost = ?, final_price = ?, final_technician_pay = ?, image_url = ? 
      WHERE id = ?
    `);
    
    stmt.run(
      data.service_id !== undefined ? data.service_id : currentOs.service_id,
      data.extra_service_id !== undefined ? data.extra_service_id : currentOs.extra_service_id,
      data.vehicle_id !== undefined ? data.vehicle_id : currentOs.vehicle_id,
      data.description || currentOs.description, 
      data.status || currentOs.status,
      data.latitude !== undefined ? data.latitude : currentOs.latitude,
      data.longitude !== undefined ? data.longitude : currentOs.longitude,
      data.mileage !== undefined ? data.mileage : currentOs.mileage,
      data.hours_worked !== undefined ? data.hours_worked : currentOs.hours_worked,
      data.travel_cost !== undefined ? data.travel_cost : currentOs.travel_cost,
      data.final_price !== undefined ? data.final_price : currentOs.final_price,
      data.final_technician_pay !== undefined ? data.final_technician_pay : currentOs.final_technician_pay,
      imageUrl, 
      id
    );

    let changes = 'OS Atualizada. ';
    if (data.status && data.status !== currentOs.status) changes += `Status alterado. `;
    db.prepare('INSERT INTO os_history (os_id, user_id, previous_status, new_status, changes) VALUES (?, ?, ?, ?, ?)').run(id, userId, currentOs.status, data.status || currentOs.status, changes);

    if (data.technician_ids && Array.isArray(data.technician_ids)) {
      db.prepare('DELETE FROM os_technicians WHERE os_id = ?').run(id);
      const stmtTech = db.prepare('INSERT INTO os_technicians (os_id, technician_id) VALUES (?, ?)');
      data.technician_ids.forEach((tId: number) => stmtTech.run(id, tId));
    }

    return this.getById(id);
  }

  async updateStatus(id: number, status: string, userId: number) {
    const currentOs = this.getById(id) as any;
    if (!currentOs) throw new Error('OS not found');
    db.prepare('UPDATE service_orders SET status = ? WHERE id = ?').run(status, id);
    db.prepare('INSERT INTO os_history (os_id, user_id, previous_status, new_status, changes) VALUES (?, ?, ?, ?, ?)').run(id, userId, currentOs.status, status, `Status alterado para ${status}`);
    return this.getById(id);
  }

  async addMaterial(osId: number, data: any, userId: number) {
    const order = this.getById(osId) as any;
    if (!order) throw new Error('OS not found');

    const quantity = Number(data.quantity || 0);
    if (!quantity || quantity <= 0) {
      throw new Error('Informe uma quantidade valida');
    }

    const transaction = db.transaction(() => {
      const item = db.prepare(`
        SELECT id, name, unit, unit_cost, quantity
        FROM inventory_items
        WHERE id = ?
      `).get(data.inventory_item_id) as any;

      if (!item) {
        throw new Error('Item de estoque nao encontrado');
      }

      if (Number(item.quantity || 0) < quantity) {
        throw new Error('Estoque insuficiente para essa baixa');
      }

      db.prepare(`
        INSERT INTO service_order_materials (
          os_id, inventory_item_id, item_name_snapshot, unit_snapshot, unit_cost_snapshot, quantity, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        osId,
        item.id,
        item.name,
        item.unit || 'un',
        item.unit_cost || 0,
        quantity,
        data.notes || null
      );

      db.prepare(`
        UPDATE inventory_items
        SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(quantity, item.id);
    });

    transaction();
    db.prepare('INSERT INTO os_history (os_id, user_id, previous_status, new_status, changes) VALUES (?, ?, ?, ?, ?)').run(osId, userId, order.status, order.status, 'Material baixado do estoque');
    return this.getMaterialsByOs(osId);
  }

  async updateMaterial(osId: number, materialId: number, data: any, userId: number) {
    const order = this.getById(osId) as any;
    if (!order) throw new Error('OS not found');

    const nextQuantity = Number(data.quantity || 0);
    if (!nextQuantity || nextQuantity <= 0) {
      throw new Error('Informe uma quantidade valida');
    }

    const transaction = db.transaction(() => {
      const material = db.prepare(`
        SELECT *
        FROM service_order_materials
        WHERE id = ? AND os_id = ?
      `).get(materialId, osId) as any;

      if (!material) {
        throw new Error('Material da OS nao encontrado');
      }

      const item = db.prepare(`
        SELECT id, name, unit, unit_cost, quantity
        FROM inventory_items
        WHERE id = ?
      `).get(material.inventory_item_id) as any;

      if (!item) {
        throw new Error('Item de estoque nao encontrado');
      }

      const delta = nextQuantity - Number(material.quantity || 0);
      if (delta > 0 && Number(item.quantity || 0) < delta) {
        throw new Error('Estoque insuficiente para aumentar essa quantidade');
      }

      db.prepare(`
        UPDATE inventory_items
        SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(delta, item.id);

      db.prepare(`
        UPDATE service_order_materials
        SET item_name_snapshot = ?, unit_snapshot = ?, unit_cost_snapshot = ?, quantity = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND os_id = ?
      `).run(
        item.name,
        item.unit || 'un',
        item.unit_cost || 0,
        nextQuantity,
        data.notes || null,
        materialId,
        osId
      );
    });

    transaction();
    db.prepare('INSERT INTO os_history (os_id, user_id, previous_status, new_status, changes) VALUES (?, ?, ?, ?, ?)').run(osId, userId, order.status, order.status, 'Material da OS ajustado');
    return this.getMaterialsByOs(osId);
  }

  async deleteMaterial(osId: number, materialId: number, userId: number) {
    const order = this.getById(osId) as any;
    if (!order) throw new Error('OS not found');

    const transaction = db.transaction(() => {
      const material = db.prepare(`
        SELECT *
        FROM service_order_materials
        WHERE id = ? AND os_id = ?
      `).get(materialId, osId) as any;

      if (!material) {
        throw new Error('Material da OS nao encontrado');
      }

      db.prepare(`
        UPDATE inventory_items
        SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(material.quantity, material.inventory_item_id);

      db.prepare('DELETE FROM service_order_materials WHERE id = ? AND os_id = ?').run(materialId, osId);
    });

    transaction();
    db.prepare('INSERT INTO os_history (os_id, user_id, previous_status, new_status, changes) VALUES (?, ?, ?, ?, ?)').run(osId, userId, order.status, order.status, 'Material removido da OS e devolvido ao estoque');
    return true;
  }

  async delete(id: number, userId: number) {
    const materials = await this.getMaterialsByOs(id) as any[];
    const restoreMaterials = db.transaction(() => {
      materials.forEach((material) => {
        db.prepare(`
          UPDATE inventory_items
          SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(material.quantity, material.inventory_item_id);
      });
    });

    restoreMaterials();
    db.prepare('DELETE FROM service_order_materials WHERE os_id = ?').run(id);
    db.prepare('DELETE FROM os_history WHERE os_id = ?').run(id);
    db.prepare('DELETE FROM os_technicians WHERE os_id = ?').run(id);
    db.prepare('DELETE FROM service_orders WHERE id = ?').run(id);
    return true;
  }
}
