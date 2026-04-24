import request from "supertest";
import pool from "../../database/postgres/pool.js";
import UsersTableTestHelper from "../../../../tests/UsersTableTestHelper.js";
import AuthenticationsTableTestHelper from "../../../../tests/AuthenticationsTableTestHelper.js";
import container from "../../container.js";
import createServer from "../createServer.js";
import AuthenticationTokenManager from "../../../Applications/security/AuthenticationTokenManager.js";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import ThreadTableTestHelper from "../../../../tests/ThreadTableTestHelper.js";
import CommentTableTestHelper from "../../../../tests/CommentTableTestHelper.js";
import RepliesTableTestHelper from "../../../../tests/RepliesTableTestHelper.js";
import CommentLikeTableHelper from "../../../../tests/CommentLikeTableTestHelper.js";

describe("HTTP server", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikeTableHelper.clearTable();
    await RepliesTableTestHelper.clearTable();
    await CommentTableTestHelper.clearTable();
    await ThreadTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it("should response 404 when request unregistered route", async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app).get("/unregisteredRoute");

    // Assert
    expect(response.status).toEqual(404);
  });

  describe("when POST /users", () => {
    it("should response 201 and persisted user", async () => {
      // Arrange
      const requestPayload = {
        username: "dicodingNew",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.addedUser).toBeDefined();
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        fullname: "Dicoding Indonesia",
        password: "secret",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada",
      );
    });

    it("should response 400 when request payload not meet data type specification", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
        fullname: ["Dicoding Indonesia"],
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "tidak dapat membuat user baru karena tipe data tidak sesuai",
      );
    });

    it("should response 400 when username more than 50 character", async () => {
      // Arrange
      const requestPayload = {
        username: "dicodingindonesiadicodingindonesiadicodingindonesiadicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "tidak dapat membuat user baru karena karakter username melebihi batas limit",
      );
    });

    it("should response 400 when username contain restricted character", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding indonesia",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "tidak dapat membuat user baru karena username mengandung karakter terlarang",
      );
    });

    it("should response 400 when username unavailable", async () => {
      // Arrange
      const username = "dicoding";
      await UsersTableTestHelper.addUser({ username: username });
      const requestPayload = {
        username: username,
        fullname: "Dicoding Indonesia",
        password: "super_secret",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("username tidak tersedia");
    });
  });

  describe("when POST /authentications", () => {
    it("should response 201 and new authentication", async () => {
      const requestPayload = {
        username: "testing_auth",
        password: "secret",
      };

      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "testing_auth",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);
      // console.log(response);

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should response 400 if username not found", async () => {
      const requestPayload = {
        username: "dicoding",
        password: "secret",
      };
      const app = await createServer(container);

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("username tidak ditemukan");
    });

    it("should response 401 if password wrong", async () => {
      const requestPayload = {
        username: "dicoding",
        password: "wrong_password",
      };
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "kredensial yang Anda masukkan salah",
      );
    });

    it("should response 400 if login payload not contain needed property", async () => {
      const requestPayload = {
        username: "dicoding",
      };
      const app = await createServer(container);

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "harus mengirimkan username dan password",
      );
    });

    it("should response 400 if login payload wrong data type", async () => {
      const requestPayload = {
        username: 123,
        password: "secret",
      };
      const app = await createServer(container);

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "username dan password harus string",
      );
    });
  });

  describe("when PUT /authentications", () => {
    it("should return 200 and new access token", async () => {
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { refreshToken } = loginResponse.body.data;
      const response = await request(app)
        .put("/authentications")
        .send({ refreshToken });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.accessToken).toBeDefined();
    });

    it("should return 400 payload not contain refresh token", async () => {
      const app = await createServer(container);

      const response = await request(app).put("/authentications").send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("harus mengirimkan token refresh");
    });

    it("should return 400 if refresh token not string", async () => {
      const app = await createServer(container);

      const response = await request(app)
        .put("/authentications")
        .send({ refreshToken: 123 });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("refresh token harus string");
    });

    it("should return 400 if refresh token not valid", async () => {
      const app = await createServer(container);

      const response = await request(app)
        .put("/authentications")
        .send({ refreshToken: "invalid_refresh_token" });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("refresh token tidak valid");
    });

    it("should return 400 if refresh token not registered in database", async () => {
      const app = await createServer(container);
      const refreshToken = await container
        .getInstance(AuthenticationTokenManager.name)
        .createRefreshToken({ username: "dicoding" });

      const response = await request(app)
        .put("/authentications")
        .send({ refreshToken });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "refresh token tidak ditemukan di database",
      );
    });
  });

  describe("when DELETE /authentications", () => {
    it("should response 200 if refresh token valid", async () => {
      const app = await createServer(container);
      const refreshToken = "refresh_token";
      await AuthenticationsTableTestHelper.addToken(refreshToken);

      const response = await request(app)
        .delete("/authentications")
        .send({ refreshToken });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
    });

    it("should response 400 if refresh token not registered in database", async () => {
      const app = await createServer(container);
      const refreshToken = "refresh_token";

      const response = await request(app)
        .delete("/authentications")
        .send({ refreshToken });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "refresh token tidak ditemukan di database",
      );
    });

    it("should response 400 if payload not contain refresh token", async () => {
      const app = await createServer(container);

      const response = await request(app).delete("/authentications").send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("harus mengirimkan token refresh");
    });
  });

  describe("when POST /threads", () => {
    it("should response 401 if no authenticate", async () => {
      // Arrange
      const payload = {
        title: "sebuah thread",
        body: "sebuah body thread",
      };

      // Action
      const app = await createServer(container);
      const response = await request(app).post("/threads").send(payload);

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Missing authentication");
    });

    it("should response 400 if bad payload", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const payload = {};

      // Action
      const response = await request(app)
        .post("/threads")
        .send(payload)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        "payload thread tidak boleh kosong",
      );
    });

    it("should response 200 if valid payload", async () => {
      // Arrange

      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const payload = {
        title: "test-threads",
        body: "ini adalah first thread",
      };

      // Action
      const response = await request(app)
        .post("/threads")
        .send(payload)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.data).toMatchObject({
        addedThread: {
          id: expect.any(String),
          title: expect.any(String),
        },
      });
    });
  });

  describe("when POST /threads/:threadId/comments", () => {
    it("should response 401 if no authenticate", async () => {
      // Arrange
      const idThread = `thread-${Date.now()}`;
      await UsersTableTestHelper.addUser({ username: "test555" });
      await ThreadTableTestHelper.addThread({
        id: idThread,
        owner: "user-123",
      });

      const payload = {
        content: "sebuah content",
      };

      // Action
      const app = await createServer(container);
      const response = await request(app)
        .post(`/threads/${idThread}/comments`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Missing authentication");
    });

    it("should response 404 if not found thread", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      // Action
      const response = await request(app)
        .post("/threads/xxx/comments")
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Thread tidak ditemukan");
    });

    it("should response 400 if invalid payload", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        "payload comment tidak boleh kosong",
      );
    });

    it("should response 200 if authenticate thread found and valid payload", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.data).toMatchObject({
        addedComment: {
          id: expect.any(String),
          content: expect.any(String),
          owner: expect.any(String),
        },
      });
    });
  });

  describe("when DELETE /threads/:threadId/comments/:commentId", () => {
    it("should response 401 if not authenticate", async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).delete("/threads/xxx/comments/xxx");

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Missing authentication");
    });

    it("should response 404 if comment not found", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/xxx`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("komentar tidak ditemukan");
    });

    it("should response 200 if comment found & authenticate", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      const commentId = commentResult.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual("success remove comments");
    });
  });

  describe("when POST /threads/:threadId/comments/:commentId/replies", () => {
    it("should response 401 if not authenticate", async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).post(
        "/threads/xxx/comments/xxx/replies",
      );

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Missing authentication");
    });
    it("should response 404 if thread not found", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      // Action
      const response = await request(app)
        .post("/threads/xxx/comments/xxx/replies")
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Thread tidak ditemukan");
    });
    it("should response 404 if comment not found", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/xxx/replies`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("komentar tidak ditemukan");
    });

    it("should response 400 if bad payload", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      const commentId = commentResult.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        "payload added reply tidak boleh kosong",
      );
    });

    it("should response 201 if authenticate thread comment found and payload is correct", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      const commentId = commentResult.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah balasan",
        });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.data).toMatchObject({
        addedReply: {
          content: expect.any(String),
          id: expect.any(String),
          owner: expect.any(String),
        },
      });
    });
  });

  describe("when DELETE /threads/:threadId/comments/:commentId/replies/:replyId", () => {
    it("should response 401 if not authenticate", async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).delete(
        "/threads/xxx/comments/xxx/replies/xxx",
      );

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Missing authentication");
    });

    it("should response 200 if authenticate", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      const commentId = commentResult.body.data.addedComment.id;

      // Action
      const repliesResult = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah balasan",
        });

      const replyId = repliesResult.body.data.addedReply.id;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
    });
  });

  describe("when PUT /threads/:threadId/comments/:commentId/likes", () => {
    it("should response 401 if not authenticate", async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).put(
        "/threads/xxx/comments/xxx/likes",
      );

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Missing authentication");
    });

    it("should response 404 if invalid thread", async () => {
      // Arrange
      const threadId = "thread-12345";
      const fakeThreadId = "fake-thread-123";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      const commentId = commentResult.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .put(`/threads/${fakeThreadId}/comments/${commentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // assert
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Thread tidak ditemukan");
    });

    it("should response 404 if invalid comment", async () => {
      // Arrange
      const threadId = "thread-12345";
      const fakeCommentId = "fake-comment-123";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${fakeCommentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // assert
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("komentar tidak ditemukan");
    });

    it("like comment should response 200 if thread comment is valid", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      const commentId = commentResult.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
    });

    it("delete like comment should response 200 if thread comment is valid", async () => {
      // Arrange
      const threadId = "thread-12345";
      const app = await createServer(container);

      const resultUser = await request(app).post("/users").send({
        username: "testing2",
        password: "rahasia123",
        fullname: "anonymus",
      });

      const { id } = resultUser.body.data.addedUser;

      await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

      const responseLogin = await request(app).post("/authentications").send({
        username: "testing2",
        password: "rahasia123",
      });

      const { accessToken } = responseLogin.body.data;

      const commentResult = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "sebuah comment",
        });

      const commentId = commentResult.body.data.addedComment.id;
      await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
    });
  });

  it("when GET /threads/:threadId", async () => {
    // Arrange
    const threadId = "thread-12345";
    const app = await createServer(container);

    const resultUser = await request(app).post("/users").send({
      username: "testing2",
      password: "rahasia123",
      fullname: "anonymus",
    });

    const { id } = resultUser.body.data.addedUser;

    await ThreadTableTestHelper.addThread({ id: threadId, owner: id });

    const responseLogin = await request(app).post("/authentications").send({
      username: "testing2",
      password: "rahasia123",
    });

    const { accessToken } = responseLogin.body.data;

    await request(app)
      .post(`/threads/${threadId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "sebuah comment",
      });

    // Action
    const response = await request(app).get(`/threads/${threadId}`);

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.data).toMatchObject({
      thread: {
        body: expect.any(String),
        comments: expect.any(Array),
        date: expect.any(String),
        id: expect.any(String),
        title: expect.any(String),
        username: expect.any(String),
      },
    });
  });

  it("should handle server error correctly", async () => {
    // Arrange
    const requestPayload = {
      username: "dicoding",
      fullname: "Dicoding Indonesia",
      password: "super_secret",
    };
    const app = await createServer({});

    // Action
    const response = await request(app).post("/users").send(requestPayload);

    // Assert
    expect(response.status).toEqual(500);
    expect(response.body.status).toEqual("error");
    expect(response.body.message).toEqual("terjadi kegagalan pada server kami");
  });
});
