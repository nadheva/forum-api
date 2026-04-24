import AuthenticationTokenManager from "../../../Applications/security/AuthenticationTokenManager.js";
import AuthenticationError from "../../../Commons/exceptions/AuthenticationError.js";

const authenticationMiddleware = (container) => {
  return async (req, res, next) => {
    try {
      const tokenManager = container.getInstance(
        AuthenticationTokenManager.name,
      );

      if (!req.headers.authorization) {
        throw new AuthenticationError("Missing authentication");
      }

      const authHeader = req.headers.authorization.split(" ");

      if (!authHeader) {
        throw new AuthenticationError("Missing authentication");
      }

      const payload = await tokenManager.decodePayload(authHeader[1]);

      req.user = payload.id;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authenticationMiddleware;
