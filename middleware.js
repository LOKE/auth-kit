const { ulid } = require("ulid");
const url = require("url");

const SCOPES = ["openid", "offline", "email"];

module.exports = ({ authClient, callbackUrl }) => {
  return (req, res, next) => {
    const redirectUri = callbackUrl;

    // console.log(
    //   "loke-auth-middleware",
    //   req.method,
    //   req.originalUrl,
    //   req.params,
    //   req.query,
    //   req.cookies
    // );

    const { loke: cookie } = req.cookies;

    // Query string superceeds cookie
    const token = req.query.token || cookie && cookie.token;
    const env = req.query.env || cookie && cookie.env;
    const organization = req.query.organization || cookie && cookie.organization;

    if (!cookie || !token || tokenExpired(cookie)) {
      if (!env || !organization) {
        return res
          .status(400)
          .send("?env={env}&organization={organization} required");
      }

      return requestToken({
        res,
        env,
        organization,
        redirectUri,
        authClient
      }).catch(next);
    }

    next();
  };
};

async function requestToken({
  res,
  env,
  organization,
  redirectUri,
  authClient
}) {
  console.log(
    "Redirecting to LOKE for authorization with organization " + organization
  );
  const state = ulid();
  res.cookie(
    "loke-auth",
    { state, env, organization },
    { path: url.parse(redirectUri).path }
  );

  const client = await authClient();
  const authUrl = client.authorizationUrl({
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    prompt: "consent", // This lets the user select their org again
    state,
    login_hint: `org=${organization}` // ,env=${env}
  });

  console.log(`Redirecting to ${authUrl}`);
  res.redirect(authUrl);
}

function tokenExpired(cookie) {
  if (!cookie || !cookie.expires) return true;
  const expiryDate = new Date(cookie.expires * 1000);
  const nowDate = new Date();
  return expiryDate <= nowDate;
}
