const createCallbackHandler = require("./callback-handler");
const createMiddleware = require("./middleware");
const createAuthClient = require("./client");

module.exports = ({ clientId, clientSecret, callbackPath }) => {
  const authClient = createAuthClient({ clientId, clientSecret });
  const callbackHandler = createCallbackHandler({ authClient });
  const middleware = createMiddleware({ authClient, callbackPath });

  return { callbackHandler, middleware, client: authClient };
};
