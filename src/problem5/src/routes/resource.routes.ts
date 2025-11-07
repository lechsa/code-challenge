import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';

const router = Router();

// Create a new resource
router.post('/', ResourceController.create);

// List all resources with filters
router.get('/', ResourceController.getAll);

// Get a specific resource by ID
router.get('/:id', ResourceController.getById);

// Update a resource
router.put('/:id', ResourceController.update);

// Delete a resource
router.delete('/:id', ResourceController.delete);

export default router;
