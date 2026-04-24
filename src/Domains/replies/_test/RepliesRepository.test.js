import { describe, expect, it } from "vitest";
import RepliesRepository from "../RepliesRepository";

describe("RepliesRepository Interface Test", () => {
  it("should error when invoke replies repository method", async () => {
    // Arrange
    const repliesRepository = new RepliesRepository();

    // Action & Assert
    await expect(repliesRepository.addReply({})).rejects.toThrowError(
      "REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );

    await expect(
      repliesRepository.getRepliesByCommentId(""),
    ).rejects.toThrowError("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(
      repliesRepository.getRepliesByThreadId(""),
    ).rejects.toThrowError("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(
      repliesRepository.verifyReplyOwner("", ""),
    ).rejects.toThrowError("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(
      repliesRepository.checkReplyAvailability(""),
    ).rejects.toThrowError("REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(repliesRepository.deleteReply("")).rejects.toThrowError(
      "REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });
});
