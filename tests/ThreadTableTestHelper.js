import pool from "../src/Infrastructures/database/postgres/pool";

const ThreadTableTestHelper = {
  async addThread({
    id = "thread-1234",
    title = "New Thread Example",
    body = "Thread untuk uji coba",
    owner = "user-1234",
    date = "2021-08-08T07:22:33.555Z",
  }) {
    const result = await pool.query(
      "INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner",
      [id, title, body, owner, date],
    );

    return result.rows;
  },

  async findThreadsById(id) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM threads ");
  },
};

export default ThreadTableTestHelper;
