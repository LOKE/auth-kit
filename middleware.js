const { ulid } = require("ulid");

const SCOPES = ["openid", "offline", "email"];

module.exports = ({ authClient, callbackPath }) => {
  return (req, res, next) => {
    const redirectUri = req.protocol + "://" + req.get("host") + callbackPath;

    console.log("loke-auth-middleware", req.method, req.originalUrl, req.params, req.query, req.cookies);

    const { env, token, organization } = req.query;
    const { loke: cookie } = req.cookies;

    if (!cookie) {
      if (!env) {
        return res.status(400).send("?env={env} required");
      }

      if (!token) {
        if (!organization) {
          return res.status(400).send("?organization={organization} required");
        }
        return requestToken({ res, env, organization, redirectUri, authClient, callbackPath }).catch(next);
      }
    }

    next();
  };
};

async function requestToken({ res, env, organization, redirectUri, authClient, callbackPath }) {
  console.log(
    "Redirecting to LOKE for authorization with organization " + organization
  );
  const state = ulid();
  res.cookie(
    "loke-auth",
    { state, env, organization },
    { path: callbackPath }
  );

  const client = await authClient();
  const authUrl = client.authorizationUrl({
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    prompt: "consent", // This lets the user select their org again
    state,
    login_hint: `org=${organization},env=${env}`
  });

  console.log(`Redirecting to ${authUrl}`);
  res.redirect(authUrl);
}
