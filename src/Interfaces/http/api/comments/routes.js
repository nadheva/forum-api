import express from "express";
import authenticationMiddleware from "../../middlewares/authenticationMiddleware.js";
import replies from "../replies/index.js";
import likes from "../likes/index.js";

const createCommentsRouter = (controller, container) => {
  const router = express.Router({ mergeParams: true });

  router.post(
    "/",
    authenticationMiddleware(container),
    controller.addCommentController,
  );

  router.delete(
    "/:commentId",
    authenticationMiddleware(container),
    controller.deleteCommentController,
  );

  router.use("/:commentId/likes", likes(container));
  router.use("/:commentId/replies", replies(container));

  return router;
};

export default createCommentsRouter;
