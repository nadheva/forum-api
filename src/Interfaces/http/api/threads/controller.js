import autoBind from "auto-bind";
import AddThreadUseCase from "../../../../Applications/use_case/threads/AddThreadUseCase.js";
import ThreadDetailUseCase from "../../../../Applications/use_case/threads/ThreadDetailUseCase.js";

class ThreadsController {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async addThreadController(req, res, next) {
    try {
      const addThreadUseCase = this._container.getInstance(
        AddThreadUseCase.name,
      );

      const addedThread = await addThreadUseCase.execute(req.user, req.body);

      res.status(201).json({
        status: "success",
        data: {
          addedThread: addedThread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadCommentController(req, res, next) {
    try {
      const threadId = req.params.threadId;

      const detailThreadUseCase = this._container.getInstance(
        ThreadDetailUseCase.name,
      );

      const threadDetail = await detailThreadUseCase.execute(threadId);

      res.status(200).json({
        status: "success",
        data: {
          thread: threadDetail,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadsController;
