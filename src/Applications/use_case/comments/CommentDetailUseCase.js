import DomainErrorTranslator from "../../../Commons/exceptions/DomainErrorTranslator.js";
import CommentDetail from "../../../Domains/comments/entities/CommentDetail.js";

class CommentDetailUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId) {
    try {
      if (!threadId || !commentId) {
        throw new Error(
          "comment detail tidak memiliki thread dan comment spesifik",
        );
      }

      await this._threadRepository.checkThreadAvailability(threadId);
      await this._commentRepository.checkCommentAvailability(
        commentId,
        threadId,
      );

      const comments =
        await this._commentRepository.getCommentsByThreadId(threadId);

      const commentData = Array.isArray(comments) 
        ? comments.find((c) => c.id === commentId) || comments[0] 
        : comments;
      return new CommentDetail(commentData);
    } catch (error) {
      const getError = DomainErrorTranslator.translate(error);
      throw getError;
    }
  }
}

export default CommentDetailUseCase;