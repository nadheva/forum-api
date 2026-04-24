import { describe, expect, it } from "vitest";
import NewThread from "../NewThread";

describe("NewThread entities", () => {
  it("should throw error when payload not contain needed", () => {
    // Arrange
    const payload = {
      title: "Perang Dunia Ketiga",
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "REGISTERED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload doesnt meet data type", () => {
    // Arrange
    const payload = {
      title: ["Baju", "Buku", "Sepatu"],
      body: "Perang ini dimulai dari negara Iran dengan negara Israel & Amerika",
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "REGISTERED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should create NewThread entities with payload correctly", () => {
    // Arrange
    const payload = {
      title: "Perang Dunia Ketiga",
      body: "Perang ini dimulai dari negara Iran dengan negara Israel & Amerika",
    };

    // Action
    const newThread = new NewThread(payload);
    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.title).toEqual(payload.title);
  });
});
