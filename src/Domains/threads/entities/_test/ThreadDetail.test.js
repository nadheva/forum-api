import { describe, expect, it } from "vitest";
import ThreadDetail from "./../ThreadDetail";

describe("ThreadDetail", () => {
  it("should throw error when payload does not contain needed property", () => {
    const payload = {
      id: "thread-1",
      title: "title",
      body: "body",
      date: "2026-03-17",
    };

    expect(() => new ThreadDetail(payload)).toThrowError(
      "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload does not meet data type specification", () => {
    const payload = {
      id: "thread-1",
      title: "title",
      body: "body",
      date: "2026-03-17",
      username: "user",
      comments: "no comment", // should be string based on your class
    };

    expect(() => new ThreadDetail(payload)).toThrowError(
      "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should create ThreadDetail object correctly when payload is valid", () => {
    const payload = {
      id: "thread-1",
      title: "title",
      body: "body",
      date: "2026-03-17",
      username: "user",
      comments: [
        {
          id: "comment-_pby2_tmXV6bcvcdev8xk",
          username: "johndoe",
          date: "2021-08-08T07:22:33.555Z",
          content: "sebuah comment",
        },
      ],
    };

    const threadDetail = new ThreadDetail(payload);

    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(Array.isArray(threadDetail.comments)).toEqual(true);
  });
});
