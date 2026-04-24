import { afterAll, afterEach, describe, expect, it } from "vitest";
import UsersTableTestHelper from "../../../../tests/UsersTableTestHelper.js";
import InvariantError from "../../../Commons/exceptions/InvariantError.js";
import RegisterUser from "../../../Domains/users/entities/RegisterUser.js";
import RegisteredUser from "../../../Domains/users/entities/RegisteredUser.js";
import pool from "../../database/postgres/pool.js";
import UserRepositoryPostgres from "../UserRepositoryPostgres.js";
import { nanoid } from "nanoid";

describe("UserRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyAvailableUsername function", () => {
    it("should throw InvariantError when username not available", async () => {
      // Arrange
      const userId = `user-${nanoid()}`;
      const username = `username-${Date.now()}`;

      await UsersTableTestHelper.addUser({ id: userId, username: username });

      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        userRepositoryPostgres.verifyAvailableUsername(username),
      ).rejects.toThrowError(InvariantError);
    });

    it("should not throw InvariantError when username available", async () => {
      // Arrange
      const userId = `user-${nanoid()}`;
      const username = `username-${Date.now()}`;
      const usernameAvailable = `username-${nanoid()}`;

      await UsersTableTestHelper.addUser({ id: userId, username: username });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        userRepositoryPostgres.verifyAvailableUsername(usernameAvailable),
      ).resolves.not.toThrowError(InvariantError);
    });
  });

  describe("addUser function", () => {
    it("should persist register user and return registered user correctly", async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: "dicoding",
        password: "secret_password",
        fullname: "Dicoding Indonesia",
      });
      const userIdGenerator = () => 1;
      const userRepositoryPostgres = new UserRepositoryPostgres(
        pool,
        userIdGenerator,
      );

      // Action
      await userRepositoryPostgres.addUser(registerUser);

      // Assert
      const users = await UsersTableTestHelper.findUsersById("user-1");
      expect(users).toHaveLength(1);
    });

    it("should return registered user correctly", async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: "dicoding",
        password: "secret_password",
        fullname: "Dicoding Indonesia",
      });

      const userIdGenerator = () => 2;
      const userRepositoryPostgres = new UserRepositoryPostgres(
        pool,
        userIdGenerator,
      );

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(
        new RegisteredUser({
          id: "user-2",
          username: "dicoding",
          fullname: "Dicoding Indonesia",
        }),
      );
    });
  });

  describe("getPasswordByUsername", () => {
    it("should throw InvariantError when user not found", () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        userRepositoryPostgres.getPasswordByUsername("dicoding"),
      ).rejects.toThrowError(InvariantError);
    });

    it("should return username password when user is found", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const userId = `user-${Date.now()}`;
      await UsersTableTestHelper.addUser({
        id: userId,
        username: "dicoding",
        password: "secret_password",
      });

      // Action & Assert
      const password =
        await userRepositoryPostgres.getPasswordByUsername("dicoding");
      expect(password).toBe("secret_password");
    });
  });

  describe("getIdByUsername", () => {
    it("should throw InvariantError when user not found", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        userRepositoryPostgres.getIdByUsername("dicoding"),
      ).rejects.toThrowError(InvariantError);
    });

    it("should return user id correctly", async () => {
      // Arrange
      const idUser = `user-${Date.now()}`;

      await UsersTableTestHelper.addUser({
        id: idUser,
        username: "correct-user",
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const userId =
        await userRepositoryPostgres.getIdByUsername("correct-user");

      // Assert
      expect(userId).toEqual(idUser);
    });
  });
});
