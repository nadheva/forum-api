import { describe, expect, it, vi } from "vitest";
import ThreadRepository from "../../../../Domains/threads/ThreadRepository";
import CommentRepository from "../../../../Domains/comments/CommentRepository";
import DeleteCommentUseCase from "../DeleteCommentUseCase";

describe("DeleteComment use case", () => {
  it("should throw error if thread not found", async () => {
    const userId = "user-1234";
    const payload = {
      threadId: "thread-123",
      commentId: "comment-123",
    };

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.reject(new Error("Thread tidak ditemukan"))
    );

    const useCase = new DeleteCommentUseCase(mockRepository);

    await expect(useCase.execute(userId, payload)).rejects.toThrowError(
      "Thread tidak ditemukan"
    );

    expect(mockRepository.threadRepository.checkThreadAvailability).toHaveBeenCalledWith(payload.threadId);
  });

  it("should throw error if comment not available", async () => {
    const userId = "user-1234";
    const payload = {
      threadId: "thread-123",
      commentId: "comment-123",
    };

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve()
    );

    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.reject(new Error("komentar tidak valid"))
    );

    const useCase = new DeleteCommentUseCase(mockRepository);

    await expect(useCase.execute(userId, payload)).rejects.toThrowError(
      "komentar tidak valid"
    );

    expect(mockRepository.threadRepository.checkThreadAvailability).toHaveBeenCalledWith(payload.threadId);
    expect(mockRepository.commentRepository.checkCommentAvailability).toHaveBeenCalledWith(payload.commentId, payload.threadId);
  });

  it("should throw error if comment delete not with owner", async () => {
    const userId = "user-1234";
    const payload = {
      threadId: "thread-123",
      commentId: "comment-123",
    };

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve()
    );

    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve()
    );

    mockRepository.commentRepository.verifyCommentOwner = vi.fn(() =>
      Promise.reject(new Error("You not have access for this comment"))
    );

    const useCase = new DeleteCommentUseCase(mockRepository);

    await expect(useCase.execute(userId, payload)).rejects.toThrowError(
      "You not have access for this comment"
    );

    expect(mockRepository.threadRepository.checkThreadAvailability).toHaveBeenCalledWith(payload.threadId);
    expect(mockRepository.commentRepository.checkCommentAvailability).toHaveBeenCalledWith(payload.commentId, payload.threadId);
    expect(mockRepository.commentRepository.verifyCommentOwner).toHaveBeenCalledWith(payload.commentId, userId);
  });

  it("should pass if thread comment found & delete with owner", async () => {
    const userId = "user-1234";
    const payload = {
      threadId: "thread-1234",
      commentId: "comment-1234",
    };

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve()
    );
    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve()
    );
    mockRepository.commentRepository.verifyCommentOwner = vi.fn(() =>
      Promise.resolve()
    );
    mockRepository.commentRepository.deleteCommentById = vi.fn(() =>
      Promise.resolve()
    );

    const useCase = new DeleteCommentUseCase(mockRepository);

    await expect(useCase.execute(userId, payload)).resolves.toBeUndefined();

    expect(mockRepository.threadRepository.checkThreadAvailability).toHaveBeenCalledWith(payload.threadId);
    expect(mockRepository.commentRepository.checkCommentAvailability).toHaveBeenCalledWith(payload.commentId, payload.threadId);
    expect(mockRepository.commentRepository.verifyCommentOwner).toHaveBeenCalledWith(payload.commentId, userId);
    expect(mockRepository.commentRepository.deleteCommentById).toHaveBeenCalledWith(payload.commentId);
  });
});