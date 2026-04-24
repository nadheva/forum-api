import LikesController from "./controller.js";
import createLikesRoute from "./routes.js";

export default (container) => {
  const likeController = new LikesController(container);
  return createLikesRoute(likeController, container);
};
