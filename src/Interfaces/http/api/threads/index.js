import ThreadsController from "./controller.js";
import createThreadsRouter from "./routes.js";

export default (container) => {
  const threadController = new ThreadsController(container);
  return createThreadsRouter(threadController, container);
};
