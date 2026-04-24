import pool from "../src/Infrastructures/database/postgres/pool";

const CommentTableTestHelper = {
  async addComment(userId, threadId, commentId, comment) {
    const { content, date } = comment;

    const result = await pool.query(
      "INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      [commentId, content, userId, threadId, date],
    );

    return result.rows[0];
  },

  async clearTable() {
    await pool.query("DELETE FROM comments ");
  },

  async findCommentsById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
};

export default CommentTableTestHelper;
