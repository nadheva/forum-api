class RepliesRepository {
  async addReply(replyRegister) {
    throw new Error("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getRepliesByCommentId(commentId) {
    throw new Error("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getRepliesByThreadId(threadId) {
    throw new Error("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyReplyOwner(replyId, owner) {
    throw new Error("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async checkReplyAvailability(replyId, commentId) {
    throw new Error("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteReply(replyId) {
    throw new Error("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

export default RepliesRepository;
