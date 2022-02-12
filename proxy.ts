import axios, { AxiosRequestConfig } from "axios"
import { URL } from "url"
import { OAuth2Client } from "google-auth-library"
import { promisify } from "util"
import http from "http"
import fs from "fs/promises"

const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
)
client.on("tokens", async (tokens) => {
  console.log("writing new tokens", tokens)
  await fs.writeFile("./authdata.json", JSON.stringify(tokens))
})
;(async () => {
  const tokenStr = await fs.readFile("./authdata.json", "utf8")
  client.setCredentials(JSON.parse(tokenStr))
  console.log("tokens loaded")
})()

const url = `https://apidata.googleusercontent.com/caldav/v2/${process.env.CALENDAR}/events`

const handler: http.RequestListener = async (req, res) => {
  const headers = await client.getRequestHeaders()
  const resp = await axios.request({
    url,
    method: "GET",
    headers,
    responseType: "arraybuffer",
    validateStatus: () => true,
  })
  res.writeHead(resp.status)
  res.end(resp.data)
}

http
  .createServer(handler)
  .listen(8123, "0.0.0.0", () =>
    console.log("listening on http://0.0.0.0:8123"),
  )
