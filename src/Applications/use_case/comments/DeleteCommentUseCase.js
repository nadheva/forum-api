class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(userId, useCaseParams) {
    const { threadId, commentId } = useCaseParams;

    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(commentId, userId);

    return this._commentRepository.deleteCommentById(commentId);
  }
}

export default DeleteCommentUseCase;
