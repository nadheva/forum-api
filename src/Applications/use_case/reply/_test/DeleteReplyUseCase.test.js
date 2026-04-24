import { describe, expect, it, vi } from "vitest";
import RepliesRepository from "../../../../Domains/replies/RepliesRepository.js";
import UserRepository from "../../../../Domains/users/UserRepository.js";
import ThreadRepository from "../../../../Domains/threads/ThreadRepository.js";
import CommentRepository from "../../../../Domains/comments/CommentRepository.js";
import DeleteReplyUseCase from "../DeleteReplyUseCase";

describe("DeleteReply use case test", () => {
  it("should throw error when comment not availability", async () => {

    const commentId = "comment-12345";
    const replyId = "reply-12345";
    const threadId = "thread-12345";
    const username = "testing-user";

    const mockRepository = {
      userRepository: new UserRepository(),
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      replyRepository: new RepliesRepository(),
    };

    mockRepository.userRepository.getUsername = vi.fn(() =>
      Promise.resolve("user-test"),
    );

    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.reject("komentar tidak ditemukan"),
    );

    mockRepository.replyRepository.checkReplyAvailability = vi.fn(() =>
      Promise.resolve(),
    );

    mockRepository.replyRepository.verifyReplyOwner = vi.fn(() =>
      Promise.resolve(),
    );

    const useCase = new DeleteReplyUseCase(mockRepository);

    await expect(
      useCase.execute(username, commentId, threadId, replyId),
    ).rejects.toThrowError("komentar tidak ditemukan");
  });

  it("should throw error when reply not availability", async () => {
    const commentId = "comment-12345";
    const replyId = "reply-12345";
    const threadId = "thread-12345";
    const username = "testing-user";

    const mockRepository = {
      userRepository: new UserRepository(),
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      repliesRepository: new RepliesRepository(),
    };

    mockRepository.userRepository.getUsername = vi.fn(() =>
      Promise.resolve("user-test"),
    );

    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve({}),
    );

    mockRepository.repliesRepository.checkReplyAvailability = vi.fn(() =>
      Promise.reject("balasan tidak ditemukan"),
    );

    mockRepository.repliesRepository.verifyReplyOwner = vi.fn(() =>
      Promise.resolve(),
    );

    mockRepository.repliesRepository.deleteReply = vi.fn(() =>
      Promise.resolve("success"),
    );

    const useCase = new DeleteReplyUseCase(mockRepository);

    await expect(
      useCase.execute(username, commentId, threadId, replyId),
    ).rejects.toThrowError("balasan tidak ditemukan");
  });

  it("should throw error when reply delete not with owner", async () => {

    const commentId = "comment-12345";
    const replyId = "reply-12345";
    const threadId = "thread-12345";
    const username = "testing-user";

    const mockRepository = {
      userRepository: new UserRepository(),
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      repliesRepository: new RepliesRepository(),
    };

    mockRepository.userRepository.getUsername = vi.fn(() =>
      Promise.resolve("user-test"),
    );

    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve({}),
    );

    mockRepository.repliesRepository.checkReplyAvailability = vi.fn(() =>
      Promise.resolve(),
    );

    mockRepository.repliesRepository.verifyReplyOwner = vi.fn(() =>
      Promise.reject("akses dilarang"),
    );

    mockRepository.repliesRepository.deleteReply = vi.fn(() =>
      Promise.resolve("success"),
    );

    const useCase = new DeleteReplyUseCase(mockRepository);

    await expect(
      useCase.execute(username, commentId, threadId, replyId),
    ).rejects.toThrowError("akses dilarang");
  });

  it("should success if delete reply is done", async () => {
    const commentId = "comment-12345";
    const replyId = "reply-12345";
    const threadId = "thread-12345";
    const username = "testing-user";

    const mockRepository = {
      userRepository: new UserRepository(),
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      repliesRepository: new RepliesRepository(),
    };

    mockRepository.userRepository.getUsername = vi.fn(() => Promise.resolve());

    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve(),
    );

    mockRepository.repliesRepository.checkReplyAvailability = vi.fn(() =>
      Promise.resolve(),
    );

    mockRepository.repliesRepository.verifyReplyOwner = vi.fn(() =>
      Promise.resolve(),
    );

    mockRepository.repliesRepository.deleteReply = vi.fn(() =>
      Promise.resolve("success"),
    );

    const useCase = new DeleteReplyUseCase(mockRepository);

    await expect(
      useCase.execute(username, commentId, threadId, replyId),
    ).resolves.toEqual("success");
  });
});
