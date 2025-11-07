import { DatabaseService } from '../config/database';
import { Resource, ResourceFilters, CreateResourceDTO, UpdateResourceDTO, PaginationParams, PaginatedResponse } from '../models/resource.model';

export class ResourceService {
  private db = DatabaseService.getInstance().getDatabase();

  /**
   * Create a new resource
   */
  create(data: CreateResourceDTO): Resource {
    const { name, description, category, status = 'active' } = data;

    const stmt = this.db.prepare(`
      INSERT INTO resources (name, description, category, status)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(name, description, category, status);
    
    return this.getById(Number(result.lastInsertRowid))!;
  }

  /**
   * Get all resources with optional filters and pagination
   */
  getAll(filters?: ResourceFilters, pagination?: PaginationParams): PaginatedResponse<Resource> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters?.name) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters?.category) {
      whereClause += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.created_at) {
      whereClause += ' AND DATE(created_at) = DATE(?)';
      params.push(filters.created_at);
    }

    if (filters?.search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM resources ${whereClause}`;
    const countStmt = this.db.prepare(countQuery);
    const { total } = countStmt.get(...params) as { total: number };

    // Get paginated data
    const dataQuery = `SELECT * FROM resources ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const dataStmt = this.db.prepare(dataQuery);
    const resources = dataStmt.all(...params, limit, offset) as Resource[];

    const totalPages = Math.ceil(total / limit);

    return {
      data: resources,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get a single resource by ID
   */
  getById(id: number): Resource | undefined {
    const stmt = this.db.prepare('SELECT * FROM resources WHERE id = ?');
    return stmt.get(id) as Resource | undefined;
  }

  /**
   * Update a resource
   */
  update(id: number, data: UpdateResourceDTO): Resource | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const fields: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }

    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }

    if (data.category !== undefined) {
      fields.push('category = ?');
      params.push(data.category);
    }

    if (data.status !== undefined) {
      fields.push('status = ?');
      params.push(data.status);
    }

    if (fields.length === 0) {
      return existing; // No fields to update
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE resources SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(query);
    stmt.run(...params);

    return this.getById(id)!;
  }

  /**
   * Delete a resource
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM resources WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Check if a resource exists
   */
  exists(id: number): boolean {
    const stmt = this.db.prepare('SELECT 1 FROM resources WHERE id = ? LIMIT 1');
    return stmt.get(id) !== undefined;
  }
}
