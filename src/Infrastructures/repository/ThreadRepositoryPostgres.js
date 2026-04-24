import NotFoundError from "../../Commons/exceptions/NotFoundError.js";
import AddedThread from "../../Domains/threads/entities/AddedThread.js";
import ThreadDetail from "../../Domains/threads/entities/ThreadDetail.js";
import ThreadRepository from "../../Domains/threads/ThreadRepository.js";

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkThreadAvailability(id) {
    const result = await this._pool.query(
      "SELECT id FROM threads WHERE id = $1",
      [id],
    );

    if (!result.rowCount) {
      throw new NotFoundError("Thread tidak ditemukan");
    }
  }

  async addThread(userId, newThread) {
    const { title, body } = newThread;

    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    try {
      const result = await this._pool.query(
        "INSERT INTO threads VALUES($1,$2, $3, $4, $5) RETURNING id, title, owner",
        [id, title, body, userId, date],
      );

      return new AddedThread({ ...result.rows[0] });
    } catch (error) {
      throw new Error(error);
    }
  }

  async getThreadById(id) {
    const result = await this._pool.query(
      "SELECT threads.id, threads.title, threads.body, threads.date::text, users.username FROM threads LEFT JOIN users ON users.id = threads.owner WHERE threads.id = $1",
      [id],
    );

    if (!result.rowCount) {
      throw new NotFoundError("Thread tidak ditemukan");
    }

    return new ThreadDetail({ ...result.rows[0] });
  }
}

export default ThreadRepositoryPostgres;
