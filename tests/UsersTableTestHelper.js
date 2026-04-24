/* istanbul ignore file */
import pool from "../src/Infrastructures/database/postgres/pool.js";

const UsersTableTestHelper = {
  async addUser({
    id = "user-123",
    username = "dicoding",
    password = "secret",
    fullname = "Dicoding Indonesia",
  }) {
    const query = {
      text: "INSERT INTO users(id, username, password, fullname) VALUES($1, $2, $3, $4) RETURNING id, username, password",
      values: [id, username, password, fullname],
    };

    const result = await pool.query(query);
    return result.rows[0].id;
  },

  async findUsersById(id) {
    const query = {
      text: "SELECT * FROM users WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM users");
  },
};

export default UsersTableTestHelper;
