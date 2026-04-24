import DomainErrorTranslator from "../../../Commons/exceptions/DomainErrorTranslator.js";
import AddedReplies from "../../../Domains/replies/entities/AddedReply.js";

class AddedReplyUseCase {
  constructor({
    repliesRepository,
    userRepository,
    commentRepository,
    threadRepository,
  }) {
    this._repliesRepository = repliesRepository;
    this._userRepository = userRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, commentId, threadId, replyCasePayload) {
    try {
      await this._threadRepository.checkThreadAvailability(threadId);
      await this._commentRepository.checkCommentAvailability(
        commentId,
        threadId,
      );

      const username = await this._userRepository.getUsername(userId);

      const newReplies = new AddedReplies(replyCasePayload);

      return this._repliesRepository.addReply(username, commentId, newReplies);
    } catch (error) {
      const getError = DomainErrorTranslator.translate(error);
      throw getError;
    }
  }
}

export default AddedReplyUseCase;
