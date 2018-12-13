const express = require("express");
const { parse: parseUrl } = require("url");

module.exports = ({ authClient, returnPath = "/organization" }) => {
  const router = express.Router();
  router.get("/callback", createHandleAuthCallback(authClient, returnPath));
  return router;
};

function createHandleAuthCallback(authClient, returnPath) {
  return async (req, res) => {
    // Currrent URL
    const pathName = parseUrl(req.originalUrl).pathname;
    const redirectUri = req.protocol + "://" + req.get("host") + pathName;

    const { state: expectedState, env, organization } = req.cookies[
      "loke-auth"
    ];

    console.log('auth redirectUri', redirectUri);

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

        res.redirect(`${returnPath}/${organization}`);
      })
      .catch(err => res.status(500).send(err.stack));
  };
}
