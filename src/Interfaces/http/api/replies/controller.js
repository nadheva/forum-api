import autoBind from "auto-bind";
import AddedReplyUseCase from "../../../../Applications/use_case/reply/AddedReplyUseCase.js";
import DeleteReplyUseCase from "../../../../Applications/use_case/reply/DeleteReplyUseCase.js";

class RepliesController {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async addReplies(req, res, next) {
    const userId = req.user;
    const { threadId, commentId } = req.params;

    const addReplyUseCase = this._container.getInstance(AddedReplyUseCase.name);

    const addedReply = await addReplyUseCase.execute(
      userId,
      commentId,
      threadId,
      req.body,
    );

    try {
      return res.status(201).json({
        status: "success",
        data: {
          addedReply: addedReply,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteReplies(req, res, next) {
    try {
      const userId = req.user;
      const { threadId, commentId, replyId } = req.params;

      const deleteReplyUseCase = this._container.getInstance(
        DeleteReplyUseCase.name,
      );

      await deleteReplyUseCase.execute(userId, commentId, threadId, replyId);

      return res.status(200).json({
        status: "success",
      });
    } catch (err) {
      next(err);
    }
  }
}

export default RepliesController;
