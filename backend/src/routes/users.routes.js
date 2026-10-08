import { Router } from 'express';
import { allowOnlyMethods } from "../middleware/allowOnlyMethods.js";

export function createUsersRouter(controller) {
  const router = Router();

  // .all() runs only if no method above it matched, so it must stay last in each chain.
  router
    .route("/")
    .get(controller.listUsers)
    .post(controller.createUser)
    .all(allowOnlyMethods(["GET", "POST"]));

  router
    .route("/:id")
    .get(controller.getUser)
    .put(controller.updateUser)
    .delete(controller.deleteUser)
    .all(allowOnlyMethods(["GET", "PUT", "DELETE"]));

  return router;
}
