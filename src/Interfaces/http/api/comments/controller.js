import autoBind from "auto-bind";
import AddCommentUseCase from "../../../../Applications/use_case/comments/AddCommentUseCase.js";
import DeleteCommentUseCase from "../../../../Applications/use_case/comments/DeleteCommentUseCase.js";

class CommentController {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async addCommentController(req, res, next) {
    try {
      const userId = req.user;
      const threadId = req.params.threadId;

      const addCommentUseCase = this._container.getInstance(
        AddCommentUseCase.name,
      );

      const addedComment = await addCommentUseCase.execute(
        userId,
        threadId,
        req.body,
      );

      res.status(201).json({
        status: "success",
        data: {
          addedComment: addedComment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentController(req, res, next) {
    try {
      const userId = req.user;

      const useCaseParams = req.params;

      const deleteCommentUseCase = this._container.getInstance(
        DeleteCommentUseCase.name,
      );

      await deleteCommentUseCase.execute(userId, useCaseParams);

      res.status(200).json({
        status: "success",
        message: "success remove comments",
      });
    } catch (error) {
      next(error);
    }
  }
}
export default CommentController;
