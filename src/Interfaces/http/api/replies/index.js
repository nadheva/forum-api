import RepliesController from "./controller.js";
import createRepliesRouter from "./routes.js";

export default (container) => {
  const repliesController = new RepliesController(container);

  return createRepliesRouter(repliesController, container);
};
