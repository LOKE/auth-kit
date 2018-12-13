const createCallbackHandler = require("./callback-handler");
const createMiddleware = require("./middleware");
const createAuthClient = require("./client");

module.exports = ({ clientId, clientSecret, callbackUrl, returnPath }) => {
  const authClient = createAuthClient({ clientId, clientSecret, callbackUrl });
  const callbackHandler = createCallbackHandler({
    authClient,
    callbackUrl,
    returnPath
  });
  const middleware = createMiddleware({ authClient, callbackUrl });

  return { callbackHandler, middleware, client: authClient };
};
