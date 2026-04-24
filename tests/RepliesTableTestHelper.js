import pool from "../src/Infrastructures/database/postgres/pool";

const RepliesTableTestHelper = {
  async clearTable() {
    await pool.query("DELETE FROM replies WHERE 1 = 1");
  },
};

export default RepliesTableTestHelper;
