import { describe, expect, it } from "vitest";
import NewReply from "../NewReply";

describe("NEWREPLIES entities test", () => {
  it("should throw erron when payload does't exist", () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });
  it("should throw erron when payload does't meet data type requirements", () => {
    // Arrange
    const payload = {
      id: 1234,
      content: "your comment id bad",
      owner: ["jokowi", "dodo"],
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });
});
