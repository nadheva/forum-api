import { afterAll, afterEach, describe, expect, it } from "vitest";
import pool from "../../database/postgres/pool";
import CommentLikeTableHelper from "../../../../tests/CommentLikeTableTestHelper";
import CommentLikeRepositoryPostgres from "../LikeRepositoryPostgres";
import { nanoid } from "nanoid";
import UsersTableTestHelper from "../../../../tests/UsersTableTestHelper";
import CommentTableTestHelper from "../../../../tests/CommentTableTestHelper";
import ThreadTableTestHelper from "../../../../tests/ThreadTableTestHelper";

describe("commentLikes repository postgres test", () => {
  afterEach(async () => {
    await CommentLikeTableHelper.clearTable();
    await CommentTableTestHelper.clearTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => await pool.end());

  describe("addLike function test", () => {
    it("should throw error if commentId & owner not reference comments & users", async () => {
      const like = {
        commentId: "fake-comment",
        owner: "users-fake",
      };
      const idLike = () => nanoid();

      const commentLikeRepository = new CommentLikeRepositoryPostgres(
        pool,
        idLike,
      );

      await expect(commentLikeRepository.addLike(like)).rejects.toThrowError();
    });

    it("should pass if comment and owner reference valid and persist to database", async () => {
      const commentId = `comment-${nanoid()}`;
      const userId = `user-${nanoid()}`;
      const threadId = `thread-${nanoid()}`;
      const idGenerator = () => nanoid();

      const like = {
        commentId: commentId,
        owner: userId,
      };

      await UsersTableTestHelper.addUser({
        id: userId,
        username: "like-user-1234",
      });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat bermanfaat",
        date: new Date().toISOString(),
      });

      const commentLikeRepository = new CommentLikeRepositoryPostgres(
        pool,
        idGenerator,
      );

      await commentLikeRepository.addLike(like);
      const likes = await CommentLikeTableHelper.findLikes(like.commentId, like.owner);
      expect(likes).toHaveLength(1);
    });
  });

  describe("getLikeByThreadId function test", () => {
    it("should empty [] if thread not found", async () => {
      const commentId = `comment-${nanoid()}`;
      const userId = `user-${nanoid()}`;
      const threadId = `thread-${nanoid()}`;
      const fakeThreadId = "thread-fake-123";
      const idGenerator = () => nanoid();

      const like = {
        commentId: commentId,
        owner: userId,
      };

      await UsersTableTestHelper.addUser({
        id: userId,
        username: "like-user-1234",
      });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat bermanfaat",
        date: new Date().toISOString(),
      });
      const commentLikeRepository = new CommentLikeRepositoryPostgres(
        pool,
        idGenerator,
      );

      await commentLikeRepository.addLike(like);
      await expect(
        commentLikeRepository.getLikesByThreadId(fakeThreadId),
      ).resolves.toEqual([]);
    });
  });

  describe("deleteLike function test", () => {
    it("should pass delete if delete like success and removed from database", async () => {
      const commentId = `comment-${nanoid()}`;
      const userId = `user-${nanoid()}`;
      const threadId = `thread-${nanoid()}`;
      const idGenerator = () => nanoid();

      const like = {
        commentId: commentId,
        owner: userId,
      };

      await UsersTableTestHelper.addUser({
        id: userId,
        username: "like-user-1234",
      });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat bermanfaat",
        date: new Date().toISOString(),
      });

      const commentLikeRepository = new CommentLikeRepositoryPostgres(
        pool,
        idGenerator,
      );

      await commentLikeRepository.addLike(like);
      await commentLikeRepository.deleteLike(like);

      const likesAfterDelete = await CommentLikeTableHelper.findLikes(like.commentId, like.owner);
      expect(likesAfterDelete).toHaveLength(0);
    });
  });

  describe("verifyUserCommentLike function test", () => {
    it("should true if comment is liked by user", async () => {
      const commentId = `comment-${nanoid()}`;
      const userId = `user-${nanoid()}`;
      const threadId = `thread-${nanoid()}`;
      const idGenerator = () => nanoid();

      const like = {
        commentId: commentId,
        owner: userId,
      };

      await UsersTableTestHelper.addUser({
        id: userId,
        username: "like-user-1234",
      });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat bermanfaat",
        date: new Date().toISOString(),
      });
      const commentLikeRepository = new CommentLikeRepositoryPostgres(
        pool,
        idGenerator,
      );

      await commentLikeRepository.addLike(like);
      await expect(
        commentLikeRepository.verifyUserCommentLike(like),
      ).resolves.toEqual(true);
    });

    it("should false if comment is no liked by user", async () => {
      const commentId = `comment-${nanoid()}`;
      const userId = `user-${nanoid()}`;
      const userId2 = `user-${nanoid()}`;
      const threadId = `thread-${nanoid()}`;
      const idGenerator = () => nanoid();

      const like = {
        commentId: commentId,
        owner: userId,
      };

      await UsersTableTestHelper.addUser({
        id: userId,
        username: "like-user-1234",
      });

      await UsersTableTestHelper.addUser({
        id: userId2,
        username: "user-anomaly",
      });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment(userId, threadId, commentId, {
        content: "Thread ini sangat bermanfaat",
        date: new Date().toISOString(),
      });
      const commentLikeRepository = new CommentLikeRepositoryPostgres(
        pool,
        idGenerator,
      );

      await commentLikeRepository.addLike(like);
      await expect(
        commentLikeRepository.verifyUserCommentLike({
          commentId: commentId,
          owner: userId2,
        }),
      ).resolves.toEqual(false);
    });
  });
});