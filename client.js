const { Issuer } = require("openid-client");

Issuer.defaultHttpOptions.timeout = 30000;

const ISSUER_URL = "https://auth.loke.global/";

module.exports = ({ clientId, clientSecret }) => {
  const authConfig = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_types: ["authorization_code", "implicit", "refresh_token"],
    response_types: ["code", "token", "id_token"],
    redirect_uris: ["https://eelink.addons.loke.global/auth/callback"]
  };
  let authClientP = null;

  function authClient() {
    if (!authClientP) {
      authClientP = Issuer.discover(ISSUER_URL).then(
        iss => new iss.Client(authConfig)
      );
    }

    return authClientP;
  }

  return authClient;
};
