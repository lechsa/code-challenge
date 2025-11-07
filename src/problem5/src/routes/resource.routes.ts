import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { validate, createResourceSchema, updateResourceSchema } from '../middleware/validation';

const router = Router();

// Create a new resource (with validation)
router.post('/', validate(createResourceSchema), ResourceController.create);

// List all resources with filters and pagination
router.get('/', ResourceController.getAll);

// Get a specific resource by ID
router.get('/:id', ResourceController.getById);

// Update a resource (with validation)
router.put('/:id', validate(updateResourceSchema), ResourceController.update);

// Delete a resource
router.delete('/:id', ResourceController.delete);

export default router;
