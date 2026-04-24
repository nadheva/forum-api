import { describe, expect, it, vi } from "vitest";
import AddThreadUseCase from "../AddThreadUseCase";
import AddedThread from "../../../../Domains/threads/entities/AddedThread";
import NewThread from "../../../../Domains/threads/entities/NewThread";

describe("AddThread usecase", () => {
  it("should throw error when payload is invalid", async () => {
    // Arrange
    const invalidPayload = {};
    const userId = "user-1234";

    const mockRepository = {
      addThread: vi.fn(),
    };

    const addThreadUseCase = new AddThreadUseCase(mockRepository);

    await expect(
      addThreadUseCase.execute(userId, invalidPayload)
    ).rejects.toThrowError("payload thread tidak boleh kosong");

    expect(mockRepository.addThread).not.toHaveBeenCalled();
  });

  it("should throw error when payload data type is wrong", async () => {
    const payloadDataWrong = {
      title: "thread-pirw1245",
      body: ["thread124", "coba1234"],
    };

    const userId = "user-1234";

    const mockRepository = {
      addThread: vi.fn(),
    };

    const addThreadUseCase = new AddThreadUseCase(mockRepository);

    await expect(
      addThreadUseCase.execute(userId, payloadDataWrong)
    ).rejects.toThrowError("payload thread tidak valid");

    expect(mockRepository.addThread).not.toHaveBeenCalled();
  });

  it("should return new thread if payload is valid", async () => {
    // Arrange
    const payloadValid = {
      title: "thread-pirw1245",
      body: "Selamat hari raya idul fitri",
    };

    const userId = "user-1234";
    const expectedAddedThread = new AddedThread({
      id: "thread-123",
      title: payloadValid.title,
      owner: userId,
    });

    const mockRepository = {
      addThread: vi.fn(() => Promise.resolve(new AddedThread({
        id: "thread-123",
        title: payloadValid.title,
        owner: userId,
      }))),
    };

    const addThreadUseCase = new AddThreadUseCase(mockRepository);

    // Action
    const addedThread = await addThreadUseCase.execute(userId, payloadValid);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockRepository.addThread).toHaveBeenCalledWith(
      userId,
      new NewThread(payloadValid)
    );
  });
});