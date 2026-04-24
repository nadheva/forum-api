import pool from "../src/Infrastructures/database/postgres/pool";

const CommentLikeTableHelper = {
  async addLikes(likeId, commentId, owner) {
    await pool.query("INSERT INTO likes VALUES($1, $2, $3)", [
      likeId,
      commentId,
      owner,
    ]);
  },

async findLikes(commentId, owner) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async clearTable() {
    await pool.query("DELETE FROM likes");
  },
};

export default CommentLikeTableHelper;
