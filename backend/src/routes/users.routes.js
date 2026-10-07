import { Router } from 'express';
import * as controller from '../controllers/users.controller.js';

const router = Router();

router.get('/', controller.listUsers);
router.get('/:id', controller.getUser);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

export default router;
