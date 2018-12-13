const express = require("express");
const { parse: parseUrl } = require("url");

module.exports = ({
  authClient,
  callbackUrl,
  returnPath = "/organization"
}) => {
  const router = express.Router();
  router.get(
    "/callback",
    createHandleAuthCallback({ authClient, callbackUrl, returnPath })
  );
  return router;
};

function createHandleAuthCallback({ authClient, callbackUrl, returnPath }) {
  return async (req, res) => {
    const redirectUri = callbackUrl;

    const { state: expectedState, env, organization } = req.cookies[
      "loke-auth"
    ];

    console.log("auth redirectUri", redirectUri);

    authClient()
      .then(c =>
        c.authorizationCallback(redirectUri, req.query, {
          response_type: "code",
          state: expectedState
        })
      )
      .then(tokenSet => {
        const {
          access_token: accessToken,
          refresh_token: refreshToken,
          id_token: idToken,
          expires_at: expires
        } = tokenSet;
        console.log("returnPath", returnPath);
        res.cookie(
          "loke",
          {
            env,
            organization,
            token: accessToken,
            refreshToken,
            // tokenType,
            expires,
            idToken
          },
          { path: `${returnPath}/${organization}` }
        );

        const to = returnPath.endsWith("/")
          ? `${returnPath}${organization}`
          : `${returnPath}/${organization}`;

        res.redirect(to);
      })
      .catch(err => res.status(500).send(err.stack));
  };
}
