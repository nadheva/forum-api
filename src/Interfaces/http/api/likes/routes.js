import express from "express";
import authenticationMiddleware from "../../middlewares/authenticationMiddleware.js";

const createLikesRoute = (controller, container) => {
  const router = express.Router({ mergeParams: true });

  router.put("/", authenticationMiddleware(container), controller.addLikes);
  return router;
};

export default createLikesRoute;
