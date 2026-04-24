import AuthenticationsController from "./controller.js";
import createAuthenticationsRouter from "./routes.js";

export default (container) => {
  const authenticationsHandler = new AuthenticationsController(container);
  return createAuthenticationsRouter(authenticationsHandler);
};
