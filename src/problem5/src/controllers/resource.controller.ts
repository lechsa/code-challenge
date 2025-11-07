import { Request, Response } from 'express';
import { ResourceService } from '../services/resource.service';
import { CreateResourceDTO, UpdateResourceDTO, ResourceFilters } from '../models/resource.model';

const resourceService = new ResourceService();

export class ResourceController {
  /**
   * POST /api/resources - Create a new resource
   */
  static create(req: Request, res: Response): void {
    try {
      const data: CreateResourceDTO = req.body;

      // Validation
      if (!data.name || !data.description || !data.category) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, description, and category are required'
        });
        return;
      }

      const resource = resourceService.create(data);

      res.status(201).json({
        success: true,
        data: resource
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * GET /api/resources - List all resources with optional filters
   * Query params: name, category, status, created_at, search
   */
  static getAll(req: Request, res: Response): void {
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

      const resources = resourceService.getAll(filters);

      res.status(200).json({
        success: true,
        count: resources.length,
        filters: filters,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * GET /api/resources/:id - Get a single resource by ID
   */
  static getById(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID'
        });
        return;
      }

      const resource = resourceService.getById(id);

      if (!resource) {
        res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * PUT /api/resources/:id - Update a resource
   */
  static update(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      const data: UpdateResourceDTO = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID'
        });
        return;
      }

      const resource = resourceService.update(id, data);

      if (!resource) {
        res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * DELETE /api/resources/:id - Delete a resource
   */
  static delete(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID'
        });
        return;
      }

      const deleted = resourceService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}
