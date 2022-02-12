import { OAuth2Client } from "google-auth-library"
import http from "http"
import { URL } from "url"

const handler: http.RequestListener = async (req, res) => {
  const url = new URL(req.url!, "http://example.com")
  const client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  )
  if (!url.search) {
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      // prompt: consent ensures we get a refresh token
      prompt: "consent",
    })
    res.writeHead(302, { Location: url })
    res.end()
    return
  } else if (url.searchParams.has("code")) {
    const code = url.searchParams.get("code")!
    const token = await client.getToken(code)
    console.log(token.tokens)
    client.setCredentials({ refresh_token: token.tokens.refresh_token })
    const headers = await client.getRequestHeaders()
    console.log(headers)
    res.writeHead(200, { "Content-Type": "text/json" })
    res.end(JSON.stringify(client.credentials))
  }
}

http
  .createServer(handler)
  .listen(8123, "localhost", () =>
    console.log("listening on http://localhost:8123"),
  )
