import db from '../db';

type SectionPayload = {
  name: string;
  description?: string;
  sort_order?: number;
};

type SubdivisionPayload = {
  section_id: number;
  name: string;
  description?: string;
  sort_order?: number;
};

type ItemPayload = {
  subdivision_id: number;
  name: string;
  sku?: string;
  quantity?: number;
  min_quantity?: number;
  unit?: string;
  unit_cost?: number;
  notes?: string;
};

export class StockService {
  async getAll() {
    const sections = db.prepare(`
      SELECT id, name, description, sort_order, created_at
      FROM inventory_sections
      ORDER BY sort_order ASC, name ASC
    `).all() as any[];

    const subdivisions = db.prepare(`
      SELECT id, section_id, name, description, sort_order, created_at
      FROM inventory_subdivisions
      ORDER BY sort_order ASC, name ASC
    `).all() as any[];

    const items = db.prepare(`
      SELECT
        ii.*,
        CASE
          WHEN ii.quantity <= COALESCE(ii.min_quantity, 0) THEN 1
          ELSE 0
        END as low_stock
      FROM inventory_items ii
      ORDER BY ii.name ASC
    `).all() as any[];

    const sectionsWithTree = sections.map((section) => {
      const sectionSubdivisions = subdivisions
        .filter((subdivision) => subdivision.section_id === section.id)
        .map((subdivision) => {
          const subdivisionItems = items.filter((item) => item.subdivision_id === subdivision.id);
          const totalQuantity = subdivisionItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
          const lowStockCount = subdivisionItems.filter((item) => Number(item.low_stock) === 1).length;

          return {
            ...subdivision,
            items: subdivisionItems,
            item_count: subdivisionItems.length,
            total_quantity: totalQuantity,
            low_stock_count: lowStockCount
          };
        });

      const totalItems = sectionSubdivisions.reduce((acc, subdivision) => acc + subdivision.item_count, 0);
      const totalQuantity = sectionSubdivisions.reduce((acc, subdivision) => acc + subdivision.total_quantity, 0);
      const lowStockCount = sectionSubdivisions.reduce((acc, subdivision) => acc + subdivision.low_stock_count, 0);

      return {
        ...section,
        subdivisions: sectionSubdivisions,
        subdivision_count: sectionSubdivisions.length,
        item_count: totalItems,
        total_quantity: totalQuantity,
        low_stock_count: lowStockCount
      };
    });

    const summary = {
      section_count: sectionsWithTree.length,
      subdivision_count: subdivisions.length,
      item_count: items.length,
      low_stock_count: items.filter((item) => Number(item.low_stock) === 1).length,
      stock_value: items.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unit_cost || 0)), 0)
    };

    return {
      sections: sectionsWithTree,
      summary
    };
  }

  async createSection(data: SectionPayload) {
    const info = db.prepare(`
      INSERT INTO inventory_sections (name, description, sort_order)
      VALUES (?, ?, ?)
    `).run(
      data.name,
      data.description || null,
      data.sort_order || 0
    );

    return db.prepare(`
      SELECT id, name, description, sort_order, created_at
      FROM inventory_sections
      WHERE id = ?
    `).get(info.lastInsertRowid as number);
  }

  async updateSection(id: number, data: SectionPayload) {
    db.prepare(`
      UPDATE inventory_sections
      SET name = ?, description = ?, sort_order = ?
      WHERE id = ?
    `).run(
      data.name,
      data.description || null,
      data.sort_order || 0,
      id
    );

    return db.prepare(`
      SELECT id, name, description, sort_order, created_at
      FROM inventory_sections
      WHERE id = ?
    `).get(id);
  }

  async deleteSection(id: number) {
    db.prepare('DELETE FROM inventory_sections WHERE id = ?').run(id);
    return true;
  }

  async createSubdivision(data: SubdivisionPayload) {
    const info = db.prepare(`
      INSERT INTO inventory_subdivisions (section_id, name, description, sort_order)
      VALUES (?, ?, ?, ?)
    `).run(
      data.section_id,
      data.name,
      data.description || null,
      data.sort_order || 0
    );

    return db.prepare(`
      SELECT id, section_id, name, description, sort_order, created_at
      FROM inventory_subdivisions
      WHERE id = ?
    `).get(info.lastInsertRowid as number);
  }

  async updateSubdivision(id: number, data: SubdivisionPayload) {
    db.prepare(`
      UPDATE inventory_subdivisions
      SET section_id = ?, name = ?, description = ?, sort_order = ?
      WHERE id = ?
    `).run(
      data.section_id,
      data.name,
      data.description || null,
      data.sort_order || 0,
      id
    );

    return db.prepare(`
      SELECT id, section_id, name, description, sort_order, created_at
      FROM inventory_subdivisions
      WHERE id = ?
    `).get(id);
  }

  async deleteSubdivision(id: number) {
    db.prepare('DELETE FROM inventory_subdivisions WHERE id = ?').run(id);
    return true;
  }

  async createItem(data: ItemPayload) {
    const info = db.prepare(`
      INSERT INTO inventory_items (subdivision_id, name, sku, quantity, min_quantity, unit, unit_cost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.subdivision_id,
      data.name,
      data.sku || null,
      data.quantity || 0,
      data.min_quantity || 0,
      data.unit || 'un',
      data.unit_cost || 0,
      data.notes || null
    );

    return db.prepare(`
      SELECT *
      FROM inventory_items
      WHERE id = ?
    `).get(info.lastInsertRowid as number);
  }

  async updateItem(id: number, data: ItemPayload) {
    db.prepare(`
      UPDATE inventory_items
      SET subdivision_id = ?, name = ?, sku = ?, quantity = ?, min_quantity = ?, unit = ?, unit_cost = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.subdivision_id,
      data.name,
      data.sku || null,
      data.quantity || 0,
      data.min_quantity || 0,
      data.unit || 'un',
      data.unit_cost || 0,
      data.notes || null,
      id
    );

    return db.prepare(`
      SELECT *
      FROM inventory_items
      WHERE id = ?
    `).get(id);
  }

  async deleteItem(id: number) {
    db.prepare('DELETE FROM inventory_items WHERE id = ?').run(id);
    return true;
  }
}
