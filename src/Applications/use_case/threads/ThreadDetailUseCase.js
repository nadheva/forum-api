import DomainErrorTranslator from "../../../Commons/exceptions/DomainErrorTranslator.js";
import ThreadDetail from "../../../Domains/threads/entities/ThreadDetail.js";

class ThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    repliesRepository,
    commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = repliesRepository;
    this._likeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    try {
      const threadDetail = await this._threadRepository.getThreadById(threadId);
      const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);
      const commentReply = await this._replyRepository.getRepliesByThreadId(threadId);
      const likeComment = await this._likeRepository.getLikesByThreadId(threadId);
      let formattedComments = threadComments;
      
      if (Array.isArray(threadComments)) {
        formattedComments = threadComments.map((comment) => ({
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.content,
          is_delete: comment.is_delete,
          likeCount: Array.isArray(likeComment) ? likeComment.filter((like) => like.comment === comment.id).length : 0,
          replies: Array.isArray(commentReply) ? commentReply
            .filter((reply) => reply.comment === comment.id)
            .map((reply) => ({
              id: reply.id,
              content: reply.content,
              date: reply.date,
              username: reply.username,
              is_delete: reply.is_delete,
            })) : [],
        }));
      }

      threadDetail.comments = formattedComments;

      return new ThreadDetail(threadDetail);
    } catch (error) {
      throw DomainErrorTranslator.translate(error);
    }
  }
}

export default ThreadDetailUseCase;