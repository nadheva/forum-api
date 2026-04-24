/* eslint-disable camelcase */
import { describe, expect, it, vi } from "vitest";
import ThreadRepository from "../../../../Domains/threads/ThreadRepository";
import CommentRepository from "../../../../Domains/comments/CommentRepository";
import CommentDetailUseCase from "../CommentDetailUseCase";
import CommentDetail from "../../../../Domains/comments/entities/CommentDetail";

describe("CommentDetail use case", () => {
  it("should throw error if no threadId & commentId", async () => {
    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.getCommentsByThreadId = vi.fn(() =>
      Promise.resolve(),
    );

    const useCase = new CommentDetailUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrowError(
      "comment detail tidak memiliki thread dan comment spesifik",
    );
  });

  it("should throw error if thread not found", async () => {
    const fakeThread = "thread-fake";
    const commentId = "comment-123";

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.reject(new Error("Thread tidak ditemukan")),
    );
    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.getCommentsByThreadId = vi.fn(() =>
      Promise.resolve(),
    );

    const useCase = new CommentDetailUseCase(mockRepository);

    await expect(useCase.execute(fakeThread, commentId)).rejects.toThrowError(
      "Thread tidak ditemukan",
    );
  });

  it("should throw error if comment not available", async () => {
    const threadId = "thread-123";
    const fakeCommand = "comment-fake";

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.reject(new Error("komentar tidak ditemukan")),
    );
    mockRepository.commentRepository.getCommentsByThreadId = vi.fn(() =>
      Promise.resolve(),
    );

    const useCase = new CommentDetailUseCase(mockRepository);

    await expect(useCase.execute(threadId, fakeCommand)).rejects.toThrowError(
      "komentar tidak ditemukan",
    );
  });

  it("should return commentDetail if all scenario is passed", async () => {
    const threadId = "thread1234";
    const commentId = "comment-123";

    const payloadDetail = [
      {
        id: "comment-123",
        username: "foobar",
        content: "komentar pertama nih!",
        date: new Date(),
        likeCount: 0,
        is_delete: true,
      },
    ];

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.getCommentsByThreadId = vi.fn(() =>
      Promise.resolve(payloadDetail),
    );

    const useCase = new CommentDetailUseCase(mockRepository);

    await expect(useCase.execute(threadId, commentId)).resolves.toBeInstanceOf(
      CommentDetail,
    );

    await expect(useCase.execute(threadId, commentId)).resolves.toMatchObject({
      content: "**komentar telah dihapus**",
      date: expect.any(Object),
      id: expect.any(String),
      username: expect.any(String),
    });
  });
});