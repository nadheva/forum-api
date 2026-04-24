import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import ThreadTableTestHelper from "../../../../tests/ThreadTableTestHelper";
import pool from "../../database/postgres/pool";
import ThreadRepositoryPostgres from "../ThreadRepositoryPostgres";
import UsersTableTestHelper from "../../../../tests/UsersTableTestHelper";
import NotFoundError from "../../../Commons/exceptions/NotFoundError";
import AddedThread from "../../../Domains/threads/entities/AddedThread";
import ThreadDetail from "../../../Domains/threads/entities/ThreadDetail";

describe("ThreadRepositoryPostgres", () => {
  const cleanDatabase = async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  };

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe.sequential("checkThreadAvailability test function", () => {
    it("should throw error if thread not found", async () => {
      const userId = `user-${Date.now()}`;

      const resultId = await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${Date.now()}`,
      });

      await ThreadTableTestHelper.addThread({
        id: "thrad6690",
        title: "Lebaran 1447 H",
        body: "Selamat Hari Raya Idul Fitri",
        owner: resultId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(
        threadRepositoryPostgres.checkThreadAvailability("thread-777"),
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe.sequential("addThread test function", () => {
    it("should throw error if users can't exist", async () => {
      const fakeUserId = "user-6690";
      const threadSeed = {
        title: "Lebaran 1447 H",
        body: "Selamat Hari Raya Idul Fitri",
      };
      const fakeIdGenerator = () => 1;
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      await expect(
        threadRepository.addThread(fakeUserId, threadSeed),
      ).rejects.toThrowError(
        'insert or update on table "threads" violates foreign key constraint "foreign_key_threads_users"',
      );
    });

    it("should pass if users is exist and persist to database", async () => {
      const userId = `user-${Date.now()}`;
      const fakeIdGenerator = () => "12345";

      const resultId = await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${Date.now()}`,
      });
      const threadSeed = {
        title: "Lebaran 1447 H",
        body: "Selamat Hari Raya Idul Fitri",
      };

      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedThread = await threadRepository.addThread(resultId, threadSeed);

      expect(addedThread).toBeInstanceOf(AddedThread);

      const threads = await ThreadTableTestHelper.findThreadsById(addedThread.id);
      expect(threads).toHaveLength(1);
    });
  });

  describe.sequential("getThreadById test function", () => {
    it("should throw error if thread not found", async () => {
      const userId = `user-${Date.now()}`;
      const resultId = await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${Date.now()}`,
      });

      await ThreadTableTestHelper.addThread({
        title: "Lebaran 1447 H",
        body: "Selamat Hari Raya Idul Fitri",
        owner: resultId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.getThreadById("thread-777"),
      ).rejects.toThrowError(NotFoundError);
    });

    it("should return threadDetail if thread is found", async () => {

      const userId = `user-${Date.now()}`;
      const resultId = await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${Date.now()}`,
      });

      const threadId = `thread-${Date.now()}`;
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Lebaran 1447 H",
        body: "Selamat Hari Raya Idul Fitri",
        owner: resultId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(
        threadRepositoryPostgres.getThreadById(threadId),
      ).resolves.toBeInstanceOf(ThreadDetail);
    });
  });
});