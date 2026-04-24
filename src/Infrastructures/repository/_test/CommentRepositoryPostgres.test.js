/* eslint-disable camelcase */
import { describe, afterAll, it, expect, afterEach, beforeEach } from "vitest";
import ThreadTableTestHelper from "../../../../tests/ThreadTableTestHelper";
import UsersTableTestHelper from "../../../../tests/UsersTableTestHelper";
import pool from "../../database/postgres/pool";
import CommentRepositoryPostgres from "../CommentRepositoryPostgres";
import AddedComment from "../../../Domains/comments/entities/AddedComment";
import CommentTableTestHelper from "../../../../tests/CommentTableTestHelper";
import { nanoid } from "nanoid";

describe("CommentRepository postgres test", () => {
  const cleanDatabase = async () => {
    await CommentTableTestHelper.clearTable();
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

  describe("addComment function test", () => {
    it("should throw error add comment with users not added", async () => {
      const fakeUserId = "user-hack";
      const threadId = `thread-${nanoid()}`;
      const userId = `user-${Date.now()}`;
      const date = new Date().toISOString();
      const idGenerator = () => Date.now();
      const commentPayload = {
        content: "Thread ini sangat bagus sekali",
        date: date,
      };
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Thread Comment",
        body: "Thread comment for testing example dummy date",
        owner: userId,
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.addComment(fakeUserId, threadId, commentPayload),
      ).rejects.toThrowError("Users does't register");
    });

    it("should throw error if payload is invalid", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const date = new Date().toISOString();
      const idGenerator = () => Date.now();
      const commentPayload = {
        content: null,
        date: date,
      };
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Thread Comment",
        body: "Thread comment for testing example dummy date",
        owner: userId,
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.addComment(userId, threadId, commentPayload),
      ).rejects.toThrowError(
        "missing column or data type for column not same date type",
      );
    });

    it("should return comment data if payload is valid and persist to database", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const date = new Date().toISOString();
      const idGenerator = () => "12345";
      const commentPayload = {
        content: "Thread ini sangat bagus sekali",
        date: date,
      };

      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Thread Comment",
        body: "Thread comment for testing example dummy date",
        owner: userId,
      });

      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      const addedComment = await commentRepository.addComment(userId, threadId, commentPayload);
      expect(addedComment).toBeInstanceOf(AddedComment);
      const comments = await CommentTableTestHelper.findCommentsById(addedComment.id);
      expect(comments).toHaveLength(1);
    });
  });

  describe("getCommentsByThreadId function test", () => {
    it("should throw error if thread not found", async () => {
      // Arrange
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const fakeThreadId = "thread-bad";
      const idGenerator = () => Date.now();
      const commentPayload = {
        content: "Thread is wrong not same actual in the world",
        date: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Thread Comment",
        body: "Thread comment for testing example dummy date",
        owner: userId,
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.addComment(userId, fakeThreadId, commentPayload),
      ).rejects.toThrowError("Thread is not post");
    });

    it("should return comment if thread is found", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const idGenerator = () => Date.now();
      const commentPayload = {
        content: "Thread is wrong not same actual in the world",
        date: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Thread Comment",
        body: "Thread comment for testing example dummy date",
        owner: userId,
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.addComment(userId, threadId, commentPayload),
      ).resolves.toMatchObject({
        content: commentPayload.content,
      });
    });
  });

  describe("deleteCommentById", () => {
    it("should throw error if comment not found", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const commentId = `comment-${Date.now()}`;
      const idGenerator = () => Date.now();
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await UsersTableTestHelper.addUser({
        id: "user-test-999",
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Thread Testing 1",
        body: "Testing thread for delete test",
        owner: userId,
      });
      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "You new car is very excellent",
        date: new Date().toISOString(),
      });
      await CommentTableTestHelper.addComment(
        "user-test-999",
        threadId,
        "comment-new-222",
        {
          content: "I think your car is bad in stoplamp section",
          date: new Date().toISOString(),
        },
      );
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.getComment(commentId),
      ).resolves.toMatchObject({
        is_delete: false,
      });
      await expect(
        commentRepository.deleteCommentById("comment-false-233"),
      ).resolves.toEqual(undefined);
      await expect(
        commentRepository.getComment(commentId),
      ).resolves.toMatchObject({
        is_delete: false,
      });
    });

    it("should success soft_delete comment", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const commentId = `comment-${Date.now()}`;
      const idGenerator = () => Date.now();
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await UsersTableTestHelper.addUser({
        id: "user-test-999",
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Thread Testing 1",
        body: "Testing thread for delete test",
        owner: userId,
      });
      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "You new car is very excellent",
        date: new Date().toISOString(),
      });
      await CommentTableTestHelper.addComment(
        "user-test-999",
        threadId,
        "comment-new-222",
        {
          content: "I think your car is bad in stoplamp section",
          date: new Date().toISOString(),
        },
      );
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.getComment(commentId),
      ).resolves.toMatchObject({
        is_delete: false,
      });
      await expect(
        commentRepository.deleteCommentById(commentId),
      ).resolves.toEqual(undefined);
      await expect(
        commentRepository.getComment(commentId),
      ).resolves.toMatchObject({
        is_delete: true,
      });
    });
  });

  describe("checkCommentAvailability", () => {
    it("should throw error if comment not found", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const commentId = `comment-${Date.now()}`;
      const fakeCommandId = "comment-bad-22";
      const idGenerator = () => Date.now();
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Tutorial monitoring server",
        body: "Gunakan tools seperti grafana, prometeus untuk mempermudah proses monitoring",
        owner: userId,
      });
      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat berguna bagi saya",
        date: new Date().toISOString(),
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.checkCommentAvailability(fakeCommandId, threadId),
      ).rejects.toThrowError("komentar tidak ditemukan");
    });

    it("should throw error if comment delete", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const commentId = `comment-${Date.now()}`;
      const idGenerator = () => Date.now();
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Tutorial monitoring server",
        body: "Gunakan tools seperti grafana, prometeus untuk mempermudah proses monitoring",
        owner: userId,
      });
      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat berguna bagi saya",
        date: new Date().toISOString(),
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.deleteCommentById(commentId),
      ).resolves.toEqual(undefined);
      await expect(
        commentRepository.checkCommentAvailability(commentId, threadId),
      ).rejects.toThrowError("komentar tidak valid");
    });

    it("should throw error if comment delete", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const commentId = `comment-${Date.now()}`;
      const fakeThreadId = "thread-fake-77";
      const idGenerator = () => Date.now();
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Tutorial monitoring server",
        body: "Gunakan tools seperti grafana, prometeus untuk mempermudah proses monitoring",
        owner: userId,
      });
      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat berguna bagi saya",
        date: new Date().toISOString(),
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.checkCommentAvailability(commentId, fakeThreadId),
      ).rejects.toThrowError("komentar dalam thread tidak ditemukan");
    });

    it("should accept comment if comment and thread is valid", async () => {
      const userId = `user-${Date.now()}`;
      const threadId = `thread-${Date.now()}`;
      const commentId = `comment-${Date.now()}`;
      const idGenerator = () => Date.now();
      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "Tutorial monitoring server",
        body: "Gunakan tools seperti grafana, prometeus untuk mempermudah proses monitoring",
        owner: userId,
      });
      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat berguna bagi saya",
        date: new Date().toISOString(),
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );
      await expect(
        commentRepository.checkCommentAvailability(commentId, threadId),
      ).resolves.toEqual(undefined);
    });
  });

  describe("verifyCommentOwner", () => {
    it("should throw error if user does't owner comment", async () => {
      // Arrange
      const userId = `user-${Date.now()}`;
      const ownerComment = `user-${nanoid()}`;
      const threadId = `thread-${Date.now()}`;
      const commentId = `comment-${Date.now()}`;
      const idGenerator = () => Date.now();
      const commentPayload = {
        content: "The thread body is very amazing information for me",
        date: new Date().toISOString(),
      };

      await UsersTableTestHelper.addUser({
        id: ownerComment,
        username: `username-${nanoid()}`,
      });

      await UsersTableTestHelper.addUser({
        id: userId,
        username: `username-${nanoid()}`,
      });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: "New Thread For Testing",
        body: "This thread used for checking owner comment authorize",
        owner: userId,
      });

      await CommentTableTestHelper.addComment(
        ownerComment,
        threadId,
        commentId,
        commentPayload,
      );

      const commentRepository = new CommentRepositoryPostgres(
        pool,
        idGenerator,
      );

      await expect(
        commentRepository.verifyCommentOwner(commentId, userId),
      ).rejects.toThrowError("You not have access for this comment");
    });
  });
});