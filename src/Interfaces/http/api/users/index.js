import UsersController from "./controller.js";
import createUsersRouter from "./routes.js";

export default (container) => {
  const usersHandler = new UsersController(container);
  return createUsersRouter(usersHandler);
};
