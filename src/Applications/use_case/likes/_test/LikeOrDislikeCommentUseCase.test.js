import { describe, expect, it, vi } from "vitest";
import ThreadRepository from "../../../../Domains/threads/ThreadRepository";
import CommentRepository from "../../../../Domains/comments/CommentRepository";
import CommentLikeRepository from "../../../../Domains/likes/CommentLikesRepository";
import LikeOrDislikeCommentUseCase from "../LikeOrDislikeCommentUseCase";

describe("LikeOrDislikeComment use case test", () => {
  it("should throw error if thread not available", async () => {
    const owner = "user-123";
    const params = {
      commentId: "comment-123",
      threadId: "thread-123",
    };

    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const likeRepository = new CommentLikeRepository();

    threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.reject("Thread tidak tersedia"),
    );

    commentRepository.checkCommentAvailability = vi.fn(() => Promise.resolve());
    likeRepository.verifyUserCommentLike = vi.fn(() => Promise.resolve(true));
    likeRepository.deleteLike = vi.fn(() => "failed");

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository: likeRepository,
    });

    await expect(
      likeOrDislikeCommentUseCase.execute(owner, params),
    ).rejects.toEqual("Thread tidak tersedia");
  });

  it("should throw error if comment not available", async () => {
    const owner = "user-123";
    const params = {
      commentId: "comment-123",
      threadId: "thread-123",
    };

    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const likeRepository = new CommentLikeRepository();

    threadRepository.checkThreadAvailability = vi.fn(() => Promise.resolve());

    commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.reject("comment tidak tersedia"),
    );

    likeRepository.verifyUserCommentLike = vi.fn(() => Promise.resolve(true));
    likeRepository.deleteLike = vi.fn(() => "failed");

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository: likeRepository,
    });

    await expect(
      likeOrDislikeCommentUseCase.execute(owner, params),
    ).rejects.toEqual("comment tidak tersedia");
  });

  it("should throw error if payload like is empty", async () => {
    const owner = null;
    const params = {};

    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const likeRepository = new CommentLikeRepository();

    threadRepository.checkThreadAvailability = vi.fn(() => Promise.resolve());
    commentRepository.checkCommentAvailability = vi.fn(() => Promise.resolve());
    likeRepository.verifyUserCommentLike = vi.fn(() => Promise.resolve(true));
    likeRepository.deleteLike = vi.fn(() => "failed");

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository: likeRepository,
    });

    await expect(
      likeOrDislikeCommentUseCase.execute(owner, params),
    ).rejects.toThrowError("payload like tidak boleh kosong");
  });

  it("should throw error if payload like meet wrong data type", async () => {
    const owner = ["user-1", "user-2"];
    const params = {
      commentId: ["comment124", "comment555"],
      threadId: ["thread123", "thread555"],
    };

    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const likeRepository = new CommentLikeRepository();

    threadRepository.checkThreadAvailability = vi.fn(() => Promise.resolve());
    commentRepository.checkCommentAvailability = vi.fn(() => Promise.resolve());
    likeRepository.verifyUserCommentLike = vi.fn(() => Promise.resolve(true));
    likeRepository.deleteLike = vi.fn(() => "failed");

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository: likeRepository,
    });

    await expect(
      likeOrDislikeCommentUseCase.execute(owner, params),
    ).rejects.toThrowError("payload like tidak valid");
  });

  it("should like if comment not like with user", async () => {
    const owner = "user-123";
    const params = {
      commentId: "comment-123",
      threadId: "thread-123",
    };

    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const likeRepository = new CommentLikeRepository();

    threadRepository.checkThreadAvailability = vi.fn(() => Promise.resolve());
    commentRepository.checkCommentAvailability = vi.fn(() => Promise.resolve());
    likeRepository.verifyUserCommentLike = vi.fn(() => Promise.resolve(false));
    likeRepository.addLike = vi.fn(() => Promise.resolve());

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository: likeRepository,
    });

    await likeOrDislikeCommentUseCase.execute(owner, params);

    expect(threadRepository.checkThreadAvailability).toHaveBeenCalledWith(params.threadId);
    expect(commentRepository.checkCommentAvailability).toHaveBeenCalledWith(params.commentId, params.threadId);
    expect(likeRepository.verifyUserCommentLike).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: owner,
        commentId: params.commentId,
      })
    );

    expect(likeRepository.addLike).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: owner,
        commentId: params.commentId,
      })
    );
  });

  it("should unlike if comment like with user", async () => {
    const owner = "user-123";
    const params = {
      commentId: "comment-123",
      threadId: "thread-123",
    };

    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const likeRepository = new CommentLikeRepository();

    threadRepository.checkThreadAvailability = vi.fn(() => Promise.resolve());
    commentRepository.checkCommentAvailability = vi.fn(() => Promise.resolve());
    likeRepository.verifyUserCommentLike = vi.fn(() => Promise.resolve(true));
    likeRepository.deleteLike = vi.fn(() => Promise.resolve());

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository: likeRepository,
    });

    await likeOrDislikeCommentUseCase.execute(owner, params);

    expect(threadRepository.checkThreadAvailability).toHaveBeenCalledWith(params.threadId);
    expect(commentRepository.checkCommentAvailability).toHaveBeenCalledWith(params.commentId, params.threadId);

    // Perbaikan: Assertion diubah menjadi object containing sesuai instruksi mentor
    expect(likeRepository.verifyUserCommentLike).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: owner,
        commentId: params.commentId,
      })
    );

    expect(likeRepository.deleteLike).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: owner,
        commentId: params.commentId,
      })
    );
  });
});