import express from "express";
import authenticationMiddleware from "../../middlewares/authenticationMiddleware.js";

const createRepliesRouter = (controller, container) => {
  const router = express.Router({ mergeParams: true });

  router.post("/", authenticationMiddleware(container), controller.addReplies);

  router.delete(
    "/:replyId",
    authenticationMiddleware(container),
    controller.deleteReplies,
  );

  return router;
};

export default createRepliesRouter;
