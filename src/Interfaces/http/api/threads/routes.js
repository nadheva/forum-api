import express from "express";
import rateLimit from "express-rate-limit";
import authenticationMiddleware from "../../middlewares/authenticationMiddleware.js";
import comments from "../comments/index.js";

const createThreadsRouter = (threadController, container) => {
  const router = express.Router({ mergeParams: true });

  const threadLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 90, 
    message: {
      status: "fail",
      message: "Terlalu banyak permintaan ke server, silakan coba lagi nanti.",
    },
  });

  router.use(threadLimiter);

  router.post(
    "/",
    authenticationMiddleware(container),
    threadController.addThreadController,
  );

  router.get("/:threadId", threadController.getThreadCommentController);

  router.use("/:threadId/comments", comments(container));

  return router;
};

export default createThreadsRouter;