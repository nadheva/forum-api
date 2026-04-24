import autoBind from "auto-bind";
import LikeOrDislikeCommentUseCase from "../../../../Applications/use_case/likes/LikeOrDislikeCommentUseCase.js";

class LikesController {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async addLikes(req, res, next) {
    try {
      const userId = req.user;

      const likeUseCase = this._container.getInstance(
        LikeOrDislikeCommentUseCase.name,
      );

      await likeUseCase.execute(userId, req.params);

      return res.status(200).json({
        status: "success",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LikesController;
