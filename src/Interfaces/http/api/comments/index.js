import CommentController from "./controller.js";
import createCommentsRouter from "./routes.js";

export default (container) => {
  const commentController = new CommentController(container);
  return createCommentsRouter(commentController, container);
};
