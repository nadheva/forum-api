import DomainErrorTranslator from "../../../Commons/exceptions/DomainErrorTranslator.js";
import Like from "../../../Domains/likes/entities/Like.js";

class LikeOrDislikeCommentUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = commentLikeRepository;
  }

  async execute(userId, useCaseParams) {
    try {
      const { threadId, commentId } = useCaseParams;

      await this._threadRepository.checkThreadAvailability(threadId);
      await this._commentRepository.checkCommentAvailability(
        commentId,
        threadId,
      );

      const like = new Like({
        commentId,
        owner: userId,
      });

      const isCommentLiked =
        await this._likeRepository.verifyUserCommentLike(like);

      return (await isCommentLiked)
        ? this._likeRepository.deleteLike(like)
        : this._likeRepository.addLike(like);
    } catch (error) {
      const getError = DomainErrorTranslator.translate(error);
      throw getError;
    }
  }
}

export default LikeOrDislikeCommentUseCase;
