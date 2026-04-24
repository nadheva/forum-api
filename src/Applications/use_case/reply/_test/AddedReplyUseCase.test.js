import { describe, expect, it, vi } from "vitest";
import UserRepository from "../../../../Domains/users/UserRepository";
import ThreadRepository from "../../../../Domains/threads/ThreadRepository";
import CommentRepository from "../../../../Domains/comments/CommentRepository";
import AddedReplyUseCase from "../AddedReplyUseCase";
import RepliesRepository from "../../../../Domains/replies/RepliesRepository";

describe("AddedReply use case", () => {
  it("should throw error when payload is empty", async () => {
    const commentId = "comment-12345";
    const threadId = "thread-12345";
    const username = "testing-user";

    const emptyPayload = {};

    const mockRepository = {
      userRepository: new UserRepository(),
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.userRepository.getUsername = vi.fn(() => Promise.resolve("testing-user"));
    mockRepository.userRepository.verifyAvailableUsername = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve(),
    );

    const useCase = new AddedReplyUseCase(mockRepository);

    await expect(
      useCase.execute(username, commentId, threadId, emptyPayload),
    ).rejects.toThrowError("payload added reply tidak boleh kosong");
  });

  it("should throw error when payload is bad data type", async () => {
    const commentId = "comment-12345";
    const threadId = "thread-12345";
    const username = "testing-user";
    const badPayload = {
      content: 12345,
      commentId: [],
      owner: "ono purbo",
      threadId: 7790,
    };

    const mockRepository = {
      userRepository: new UserRepository(),
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
    };

    mockRepository.userRepository.getUsername = vi.fn(() => Promise.resolve("testing-user"));
    mockRepository.userRepository.verifyAvailableUsername = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve(),
    );

    const useCase = new AddedReplyUseCase(mockRepository);

    await expect(
      useCase.execute(username, commentId, threadId, badPayload),
    ).rejects.toThrowError("payload added reply tidak valid");
  });

  it("should return new reply", async () => {
    const commentId = "comment-12345";
    const threadId = "thread-12345";
    const username = "testing-user";

    const payload = {
      content: "hidup jokowi",
      commentId: commentId,
      owner: username,
      threadId: threadId,
    };

    const mockReturnReply = {
      id: "reply-123",
      content: payload.content,
      owner: username,
    };

    const expectedReturnReply = {
      id: "reply-123",
      content: payload.content,
      owner: username,
    };

    const mockRepository = {
      userRepository: new UserRepository(),
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      repliesRepository: new RepliesRepository(),
    };

    mockRepository.userRepository.getUsername = vi.fn(() => Promise.resolve(username));

    mockRepository.userRepository.verifyAvailableUsername = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.threadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockRepository.commentRepository.checkCommentAvailability = vi.fn(() =>
      Promise.resolve(),
    );

    mockRepository.repliesRepository.addReply = vi.fn(() =>
      Promise.resolve(mockReturnReply),
    );

    const useCase = new AddedReplyUseCase(mockRepository);

    const result = await useCase.execute(username, commentId, threadId, payload);

    expect(result).toEqual(expectedReturnReply);
    expect(mockRepository.threadRepository.checkThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(mockRepository.commentRepository.checkCommentAvailability).toHaveBeenCalledWith(commentId, threadId);
    expect(mockRepository.userRepository.getUsername).toHaveBeenCalledWith(username);
    expect(mockRepository.repliesRepository.addReply).toHaveBeenCalledWith(
      username,
      commentId,
      expect.objectContaining({
        content: payload.content,
      })
    );
  });
});