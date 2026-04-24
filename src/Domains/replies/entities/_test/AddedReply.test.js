import { describe, expect, it } from "vitest";
import AddedReplies from "../AddedReply";

describe("ADDEDREPLY entities test", () => {
  it("should throw error when payload does't exist", () => {
    // Arrrange
    const payload = {};

    // Action & Assert
    expect(() => new AddedReplies(payload)).toThrowError(
      "ADDED_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });
  it("should throw error when payload does't meet data type requirements", () => {
    // Arrrange
    const payload = {
      content: ["content1", "content2"],
    };

    // Action & Assert
    expect(() => new AddedReplies(payload)).toThrowError(
      "ADDED_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });
});
