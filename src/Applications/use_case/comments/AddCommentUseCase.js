import DomainErrorTranslator from "../../../Commons/exceptions/DomainErrorTranslator.js";
import NewComment from "../../../Domains/comments/entities/NewComment.js";

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, userCasePayload) {
    try {
      await this._threadRepository.checkThreadAvailability(threadId);

      const newComment = new NewComment(userCasePayload);

      return this._commentRepository.addComment(userId, threadId, newComment);
    } catch (error) {
      const getError = DomainErrorTranslator.translate(error);
      throw getError;
    }
  }
}

export default AddCommentUseCase;
