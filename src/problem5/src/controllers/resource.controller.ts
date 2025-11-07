import { Request, Response, NextFunction } from 'express';
import { ResourceService } from '../services/resource.service';
import { CreateResourceDTO, UpdateResourceDTO, ResourceFilters, PaginationParams } from '../models/resource.model';
import { AppError } from '../middleware/errorHandler';

const resourceService = new ResourceService();

export class ResourceController {
  /**
   * POST /api/resources - Create a new resource
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateResourceDTO = req.body;
      const resource = await resourceService.create(data);

      res.status(201).json({
        success: true,
        data: resource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/resources - List all resources with optional filters and pagination
   * Query params: name, category, status, created_at, search, page, limit
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: ResourceFilters = {
        name: req.query.name as string,
        category: req.query.category as string,
        status: req.query.status as 'active' | 'inactive' | 'archived',
        created_at: req.query.created_at as string,
        search: req.query.search as string
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => 
        filters[key as keyof ResourceFilters] === undefined && delete filters[key as keyof ResourceFilters]
      );

      // Pagination parameters
      const pagination: PaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10
      };

      // Validate pagination parameters
      if (isNaN(pagination.page!) || pagination.page! < 1) {
        throw new AppError(400, 'Invalid page number');
      }
      if (isNaN(pagination.limit!) || pagination.limit! < 1 || pagination.limit! > 100) {
        throw new AppError(400, 'Invalid limit (must be between 1 and 100)');
      }

      const result = await resourceService.getAll(filters, pagination);

      res.status(200).json({
        success: true,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/resources/:id - Get a single resource by ID
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        throw new AppError(400, 'Invalid resource ID');
      }

      const resource = await resourceService.getById(id);

      if (!resource) {
        throw new AppError(404, 'Resource not found');
      }

      res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/resources/:id - Update a resource
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data: UpdateResourceDTO = req.body;

      if (isNaN(id)) {
        throw new AppError(400, 'Invalid resource ID');
      }

      const resource = await resourceService.update(id, data);

      if (!resource) {
        throw new AppError(404, 'Resource not found');
      }

      res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/resources/:id - Delete a resource
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        throw new AppError(400, 'Invalid resource ID');
      }

      const deleted = await resourceService.delete(id);

      if (!deleted) {
        throw new AppError(404, 'Resource not found');
      }

      res.status(200).json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
