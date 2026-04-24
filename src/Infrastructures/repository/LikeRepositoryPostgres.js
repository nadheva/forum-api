import CommentLikeRepository from "../../Domains/likes/CommentLikesRepository.js";

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(like) {
    const id = `like-${this._idGenerator()}`;

    const { commentId, owner } = like;

    await this._pool.query("INSERT INTO likes VALUES($1, $2, $3)", [
      id,
      commentId,
      owner,
    ]);
  }

  async getLikesByThreadId(threadId) {
    const result = await this._pool.query(
      `SELECT likes.* FROM likes 
      LEFT JOIN comments ON comments.id = likes.comment
      WHERE comments.thread = $1`,
      [threadId],
    );

    return result.rows;
  }

  async deleteLike(like) {
    const { commentId, owner } = like;

    await this._pool.query(
      "DELETE FROM likes WHERE comment = $1 AND owner = $2",
      [commentId, owner],
    );
  }

  async verifyUserCommentLike(like) {
    const { commentId, owner } = like;

    const result = await this._pool.query(
      "SELECT 1 FROM likes WHERE comment = $1 AND owner = $2",
      [commentId, owner],
    );

    return !!result.rowCount;
  }
}

export default CommentLikeRepositoryPostgres;
