/* eslint-disable camelcase */
import { describe, expect, it, vi } from "vitest";
import ThreadDetailUseCase from "../ThreadDetailUseCase";
import ThreadRepository from "../../../../Domains/threads/ThreadRepository";
import CommentRepository from "../../../../Domains/comments/CommentRepository";
import RepliesRepository from "../../../../Domains/replies/RepliesRepository";
import ThreadDetail from "../../../../Domains/threads/entities/ThreadDetail";
import CommentLikeRepository from "../../../../Domains/likes/CommentLikesRepository";

describe("ThreadDetail use case", () => {
  it("should throw error when ThreadDetail validation fails", async () => {
    const threadId = "thread-123";
    const invalidPayload = {};

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      repliesRepository: new RepliesRepository(),
      commentLikeRepository: new CommentLikeRepository(),
    };

    mockRepository.threadRepository.getThreadById = vi.fn(() =>
      Promise.resolve(invalidPayload)
    );
    mockRepository.commentRepository.getCommentsByThreadId = vi.fn(() =>
      Promise.resolve([])
    );
    mockRepository.repliesRepository.getRepliesByThreadId = vi.fn(() =>
      Promise.resolve([])
    );
    mockRepository.commentLikeRepository.getLikesByThreadId = vi.fn(() =>
      Promise.resolve([])
    );

    const useCase = new ThreadDetailUseCase(mockRepository);

    await expect(useCase.execute(threadId)).rejects.toThrowError(
      "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );

    expect(mockRepository.threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
  });

  it("should throw error when ThreadDetail data type is invalid", async () => {
    const threadId = "thread-123";
    const threadData = {
      id: threadId,
      title: "ini adalah thread",
      body: "selamat hari raya idul fitri",
      date: "2021-08-08T07:22:33.555Z",
      username: "user-12345",
      comments: "wrong comment",
    };

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      repliesRepository: new RepliesRepository(),
      commentLikeRepository: new CommentLikeRepository(),
    };

    mockRepository.threadRepository.getThreadById = vi.fn(() =>
      Promise.resolve(threadData)
    );
    mockRepository.commentRepository.getCommentsByThreadId = vi.fn(() =>
      Promise.resolve(threadData.comments)
    );
    mockRepository.repliesRepository.getRepliesByThreadId = vi.fn(() =>
      Promise.resolve([])
    );
    mockRepository.commentLikeRepository.getLikesByThreadId = vi.fn(() =>
      Promise.resolve([])
    );

    const useCase = new ThreadDetailUseCase(mockRepository);

    await expect(useCase.execute(threadId)).rejects.toThrowError(
      "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );

    expect(mockRepository.threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
  });

  it("should return ThreadDetail if payload is valid", async () => {
    const threadId = "thread-123";
    const threadData = {
      id: threadId,
      title: "ini adalah thread",
      body: "selamat hari raya idul fitri",
      date: "2021-08-08T07:22:33.555Z",
      username: "user-12345",
      comments: [
        {
          id: "comment-_pby2_tmXV6bcvcdev8xk",
          username: "johndoe",
          date: new Date(),
          content: "sebuah comment",
          likeCount: [
            {
              id: "like-1234",
              comment: "comment-1234",
              owner: "user-12344",
            },
          ],
          replies: [
            {
              id: "reply-1234",
              content: "ini content contoh",
              date: new Date().toISOString(),
              comment: "comment-_pby2_tmXV6bcvcdev8xk",
              username: "johndoe",
              id_delete: false,
            },
          ],
          is_delete: false,
        },
      ],
    };

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      repliesRepository: new RepliesRepository(),
      commentLikeRepository: new CommentLikeRepository(),
    };

    mockRepository.threadRepository.getThreadById = vi.fn(() =>
      Promise.resolve(threadData)
    );
    mockRepository.commentRepository.getCommentsByThreadId = vi.fn(() =>
      Promise.resolve(threadData.comments)
    );
    mockRepository.repliesRepository.getRepliesByThreadId = vi.fn(() =>
      Promise.resolve(threadData.comments[0].replies)
    );
    mockRepository.commentLikeRepository.getLikesByThreadId = vi.fn(() =>
      Promise.resolve(threadData.comments[0].likeCount)
    );

    const useCase = new ThreadDetailUseCase(mockRepository);

    await expect(useCase.execute(threadId)).resolves.toBeInstanceOf(
      ThreadDetail
    );
    expect(mockRepository.threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockRepository.commentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockRepository.repliesRepository.getRepliesByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockRepository.commentLikeRepository.getLikesByThreadId).toHaveBeenCalledWith(threadId);
  });

  it("should map deleted comments and replies correctly if is_delete is true", async () => {
    const threadId = "thread-123";
    const threadData = {
      id: threadId,
      title: "ini adalah thread",
      body: "selamat hari raya idul fitri",
      date: "2021-08-08T07:22:33.555Z",
      username: "user-12345",
      comments: [
        {
          id: "comment-_pby2_tmXV6bcvcdev8xk",
          username: "johndoe",
          date: new Date(),
          content: "sebuah comment yang harusnya hilang",
          likeCount: [],
          replies: [
            {
              id: "reply-1234",
              content: "ini content balasan yang harusnya hilang",
              date: new Date().toISOString(),
              comment: "comment-_pby2_tmXV6bcvcdev8xk",
              username: "johndoe",
              is_delete: true,
            },
          ],
          is_delete: true,
        },
      ],
    };

    const mockRepository = {
      threadRepository: new ThreadRepository(),
      commentRepository: new CommentRepository(),
      repliesRepository: new RepliesRepository(),
      commentLikeRepository: new CommentLikeRepository(),
    };

    mockRepository.threadRepository.getThreadById = vi.fn(() =>
      Promise.resolve(threadData)
    );
    mockRepository.commentRepository.getCommentsByThreadId = vi.fn(() =>
      Promise.resolve(threadData.comments)
    );
    mockRepository.repliesRepository.getRepliesByThreadId = vi.fn(() =>
      Promise.resolve(threadData.comments[0].replies)
    );
    mockRepository.commentLikeRepository.getLikesByThreadId = vi.fn(() =>
      Promise.resolve(threadData.comments[0].likeCount)
    );

    const useCase = new ThreadDetailUseCase(mockRepository);

    const threadDetail = await useCase.execute(threadId);

    expect(threadDetail.comments[0].content).toEqual("**komentar telah dihapus**");
    expect(threadDetail.comments[0].replies[0].content).toEqual("**balasan telah dihapus**");
    expect(mockRepository.threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockRepository.commentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockRepository.repliesRepository.getRepliesByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockRepository.commentLikeRepository.getLikesByThreadId).toHaveBeenCalledWith(threadId);
  });
});