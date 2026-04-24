import { describe, expect, it } from "vitest";
import ThreadRepository from "../ThreadRepository";

describe("ThreadRepository interface", () => {
  it("should throw error when invoke abstract ThreadRepository", async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
    await expect(threadRepository.getThreadById("")).rejects.toThrowError(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
    await expect(
      threadRepository.checkThreadAvailability(""),
    ).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
