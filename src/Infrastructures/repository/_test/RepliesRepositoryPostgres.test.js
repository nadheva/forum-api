/* eslint-disable camelcase */
import { afterAll, afterEach, describe, expect, it } from "vitest";
import RepliesTableTestHelper from "../../../../tests/RepliesTableTestHelper";
import UsersTableTestHelper from "../../../../tests/UsersTableTestHelper";
import ThreadTableTestHelper from "../../../../tests/ThreadTableTestHelper";
import CommentTableTestHelper from "../../../../tests/CommentTableTestHelper";
import RepliesRepositoryPostgres from "../RepliesRepositoryPostgres";
import pool from "../../database/postgres/pool";
import { nanoid } from "nanoid";
import NewReply from "../../../Domains/replies/entities/NewReply";

describe("RepliesRepository postgres test", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.clearTable();
    await CommentTableTestHelper.clearTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("add Reply function test", () => {
    it("should throw error if users does'nt exist in table", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        usernameFake: "fake-user",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      // Action
      const idGenerator = () => nanoid();
      const repliesRepository = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      await expect(
        repliesRepository.addReply(dataDummy.usernameFake, commentId.id, {
          content: "Ini feedback positive saya berikan",
        }),
      ).rejects.toBeInstanceOf(Error);
    });

    it("should throw error if comment does'nt exist in table", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        usernameFake: "fake-user",
        commentFake: "fake-comment",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      // Action
      const idGenerator = () => nanoid();
      const repliesRepository = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      await expect(
        repliesRepository.addReply(
          dataDummy.usernameFake,
          dataDummy.commentFake,
          {
            content: "Ini feedback positive saya berikan",
          },
        ),
      ).rejects.toBeInstanceOf(Error);
    });

    it("should pass if payload requirement is ok", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      // Action
      const idGenerator = () => nanoid();
      const repliesRepository = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      await expect(
        repliesRepository.addReply(dataDummy.username, commentId.id, {
          content: "Ini feedback positive saya berikan",
        }),
      ).resolves.toBeInstanceOf(NewReply);
    });
  });

  describe("getRepliesByCommentId postgres test", () => {
    it("should return [] if comment not found", async () => {
      // Arrange
      const dataDummy = {
        fakeComment: "fake-comment",
      };

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      // Assert
      await expect(
        repliesRepositoryPostgres.getRepliesByCommentId(dataDummy.fakeComment),
      ).resolves.toEqual([]);
    });

    it("should return replies if comment found", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.getRepliesByCommentId(commentId.id),
      ).resolves.toEqual([
        expect.objectContaining({
          id: expect.any(String),
          content: expect.any(String),
          comment: expect.any(String),
          date: expect.any(Object),
          is_delete: expect.any(Boolean),
          owner: expect.any(String),
        }),
      ]);
    });
  });

  describe("getRepliesByThreadId postgres test", () => {
    it("should return [] if thread not found", async () => {
      // Arrange
      const dataDummy = {
        fakeThread: "fake-thread",
      };

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      // Assert
      await expect(
        repliesRepositoryPostgres.getRepliesByThreadId(dataDummy.fakeThread),
      ).resolves.toEqual([]);
    });

    it("should return replies if thread found", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.getRepliesByThreadId(dataDummy.idThread),
      ).resolves.toEqual([
        expect.objectContaining({
          id: expect.any(String),
          content: expect.any(String),
          comment: expect.any(String),
          date: expect.any(Object),
          is_delete: expect.any(Boolean),
          owner: expect.any(String),
        }),
      ]);
    });
  });

  describe("verifyReplyOwner postgres test", () => {
    it("should throw error if reply not found", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        fakeReply: "fake-reply",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.verifyReplyOwner(
          dataDummy.fakeReply,
          dataDummy.username,
        ),
      ).rejects.toThrowError("Reply tidak ditemukan");
    });

    it("should throw error if not owner reply", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        fakeReply: "fake-reply",
        fakeOwner: "fake-owner",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      const { id } = await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.verifyReplyOwner(id, dataDummy.fakeOwner),
      ).rejects.toThrowError("akses dilarang");
    });

    it("should pass verify if scenario owner and reply is ok", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      const { id } = await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.verifyReplyOwner(id, dataDummy.username),
      ).resolves.not.toThrow();
    });
  });

  describe("checkReplyAvailability postgres test", () => {
    it("should to throw error if reply is not found", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        fakeReply: "fake-reply",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.checkReplyAvailability(
          dataDummy.fakeReply,
          commentId.id,
        ),
      ).rejects.toThrowError("balasan tidak ditemukan");
    });

    it("should to throw error if reply with is_delete is true", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        fakeReply: "fake-reply",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      const { id } = await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await repliesRepositoryPostgres.deleteReply(id);

      await expect(
        repliesRepositoryPostgres.checkReplyAvailability(id, commentId.id),
      ).rejects.toThrowError("balasan tidak valid");
    });

    it("should to throw error if reply not found in comment", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        fakeComment: "fake-comment",
        fakeReply: "fake-reply",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      const { id } = await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.checkReplyAvailability(
          id,
          dataDummy.fakeComment,
        ),
      ).rejects.toThrowError("balasan dalam komentar tidak ditemukan");
    });

    it("should to pass check reply availability", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        fakeComment: "fake-comment",
        fakeReply: "fake-reply",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      const { id } = await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.checkReplyAvailability(id, commentId.id),
      ).resolves.not.toThrow();
    });
  });

  describe("deleteReply postgres test", () => {
    it("should success soft_delete reply", async () => {
      // Arrange
      const dataDummy = {
        idUser: `user-${Date.now()}`,
        username: `username-${Date.now()}`,
        idThread: `thread-${Date.now()}`,
        idComment: `comment-${Date.now()}`,
        fakeComment: "fake-comment",
        fakeReply: "fake-reply",
        comment: {
          content: "Thread ini sangat bagus",
          date: new Date().toISOString(),
        },
      };

      await UsersTableTestHelper.addUser({
        id: dataDummy.idUser,
        username: dataDummy.username,
      });

      await ThreadTableTestHelper.addThread({
        id: dataDummy.idThread,
        owner: dataDummy.idUser,
      });

      const commentId = await CommentTableTestHelper.addComment(
        dataDummy.idUser,
        dataDummy.idThread,
        dataDummy.idComment,
        dataDummy.comment,
      );

      const idGenerator = () => nanoid();

      // Action
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        idGenerator,
      );

      const { id } = await repliesRepositoryPostgres.addReply(
        dataDummy.username,
        commentId.id,
        { content: "good feedback" },
      );

      await expect(
        repliesRepositoryPostgres.deleteReply(id),
      ).resolves.not.toThrow();
    });
  });
});
