import { Router } from 'express';

export function createUsersRouter(controller) {
  const router = Router();

  router.get('/', controller.listUsers);
  router.get('/:id', controller.getUser);
  router.post('/', controller.createUser);
  router.put('/:id', controller.updateUser);
  router.delete('/:id', controller.deleteUser);

  return router;
}
