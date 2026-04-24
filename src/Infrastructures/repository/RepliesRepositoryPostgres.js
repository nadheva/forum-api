import AuthorizationError from "../../Commons/exceptions/AuthorizationError.js";
import NotFoundError from "../../Commons/exceptions/NotFoundError.js";
import NewReply from "../../Domains/replies/entities/NewReply.js";
import RepliesRepository from "../../Domains/replies/RepliesRepository.js";

class RepliesRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(username, commentId, replyRegister) {
    const { content } = replyRegister;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const result = await this._pool.query(
      "INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      [id, content, date, commentId, username],
    );

    return new NewReply(result.rows[0]);
  }

  async getRepliesByCommentId(commentId) {
    const result = await this._pool.query(
      "SELECT * FROM replies WHERE comment = $1",
      [commentId],
    );

    return result.rows;
  }

  async getRepliesByThreadId(threadId) {
    const result = await this._pool.query(
      `SELECT replies.*, users.username 
      FROM replies
      LEFT JOIN users ON users.id = replies.owner
      LEFT JOIN comments ON comments.id = replies.comment
      WHERE comments.thread = $1 AND comments.is_delete = false
      ORDER BY replies.date ASC`,
      [threadId],
    );

    return result.rows;
  }

  async verifyReplyOwner(replyId, owner) {
    const result = await this._pool.query(
      "SELECT * FROM replies WHERE id = $1",
      [replyId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Reply tidak ditemukan");
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError("akses dilarang");
    }
  }

  async checkReplyAvailability(replyId, commentId) {
    const result = await this._pool.query(
      "SELECT * FROM replies WHERE id = $1",
      [replyId],
    );

    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }

    if (result.rows[0].is_delete) {
      throw new NotFoundError("balasan tidak valid");
    }

    if (result.rows[0].comment !== commentId) {
      throw new NotFoundError("balasan dalam komentar tidak ditemukan");
    }
  }

  async deleteReply(replyId) {
    await this._pool.query(
      "UPDATE replies SET is_delete = true WHERE id = $1",
      [replyId],
    );
  }
}

export default RepliesRepositoryPostgres;
