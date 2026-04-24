
import AuthorizationError from "../../Commons/exceptions/AuthorizationError.js";
import NotFoundError from "../../Commons/exceptions/NotFoundError.js";
import CommentRepository from "../../Domains/comments/CommentRepository.js";
import AddedComment from "../../Domains/comments/entities/AddedComment.js";

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async getComment(id) {
    const result = await this._pool.query(
      "SELECT * FROM comments WHERE id=$1",
      [id],
    );
    return result.rows[0];
  }

  async addComment(userId, threadId, newComment) {
    const { content } = newComment;

    const id = `comment-${this._idGenerator()}`;

    try {
      const result = await this._pool.query(
        "INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id,content, owner",
        [id, content, userId, threadId],
      );

      return new AddedComment(result.rows[0]);
    } catch (error) {
      if (
        error.message ===
        'insert or update on table "comments" violates foreign key constraint "foreign_key_comments_owner"'
      ) {
        throw new Error("Users does't register");
      } else if (
        error.message ===
        'null value in column "content" of relation "comments" violates not-null constraint'
      ) {
        throw new Error(
          "missing column or data type for column not same date type",
        );
      } else if (
        error.message ===
        'insert or update on table "comments" violates foreign key constraint "foreign_key_comments_threads"'
      ) {
        throw new Error("Thread is not post");
      }

      throw new Error(error);
    }
  }

  async getCommentsByThreadId(threadId) {
    const result = await this._pool.query(
      "SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete FROM comments LEFT JOIN users ON users.id = comments.owner WHERE comments.thread = $1 ORDER BY comments.date ASC",
      [threadId],
    );

    return result.rows;
  }

  async deleteCommentById(id) {
    await this._pool.query("UPDATE comments SET is_delete=true WHERE id = $1", [
      id,
    ]);
  }

  async checkCommentAvailability(commentId, threadId) {
    const result = await this._pool.query(
      "SELECT id, is_delete, thread FROM comments WHERE id = $1",
      [commentId],
    );

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }

    if (result.rows[0].is_delete) {
      throw new NotFoundError("komentar tidak valid");
    }

    if (result.rows[0].thread !== threadId) {
      throw new NotFoundError("komentar dalam thread tidak ditemukan");
    }
  }

  async verifyCommentOwner(id, owner) {
    const result = await this._pool.query(
      "SELECT owner FROM comments WHERE id = $1 ",
      [id],
    );

    if (!result.rowCount) {
      throw new NotFoundError("Komentar tidak ditemukan");
    }

    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError("You not have access for this comment");
    }
  }
}

export default CommentRepositoryPostgres;