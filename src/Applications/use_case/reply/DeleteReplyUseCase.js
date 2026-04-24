import DomainErrorTranslator from "../../../Commons/exceptions/DomainErrorTranslator.js";

class DeleteReplyUseCase {
  constructor({
    userRepository,
    threadRepository,
    commentRepository,
    repliesRepository,
  }) {
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = repliesRepository;
  }

  async execute(userId, commentId, threadId, replyId) {
    try {
      const username = await this._userRepository.getUsername(userId);

      await this._commentRepository.checkCommentAvailability(
        commentId,
        threadId,
      );

      await this._replyRepository.checkReplyAvailability(replyId, commentId);

      await this._replyRepository.verifyReplyOwner(replyId, username);

      return this._replyRepository.deleteReply(replyId);
    } catch (error) {
      const getError = DomainErrorTranslator.translate(error);
      throw getError;
    }
  }
}

export default DeleteReplyUseCase;
