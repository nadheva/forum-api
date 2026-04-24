import { describe, expect, it } from "vitest";
import AddedThread from "../AddedThread";

describe("AddedThread entities", () => {
  it("should throw error when payload doesnt contain needed property", () => {
    // Arrange
    const payload = {
      id: "thread-fhwrh1234",
      title: "Iran vs Israel",
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload doesnt meet data type", () => {
    // Arrange
    const payload = {
      id: "thread-fhwrh1234",
      title: "Iran vs Israel",
      owner: ["Trump", "Prabowo"],
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should create AddedThread entities with correct payload", () => {
    // Arrange
    const payload = {
      id: "thread-fhwrh1234",
      title: "Iran vs Israel",
      owner: "Trump",
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
