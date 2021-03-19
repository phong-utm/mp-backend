import http from "http"

import config from "./common/config"
import createApp from "./app"
import WebSocketDataPush from "./infrastructure/WebSocketDataPush"
import LocalPubSub from "./infrastructure/LocalPubSub"
import FilesystemRouteRepository from "./infrastructure/FilesystemRouteRepository"

const { port, env } = config

const pubsub = new LocalPubSub()
const dataPush = new WebSocketDataPush()
const routeRepo = new FilesystemRouteRepository()
const app = createApp(pubsub, dataPush, routeRepo)
const server = http.createServer(app).listen(port, () => {
  console.log(`Server listening on port ${port} in ${env} mode...`)
})
dataPush.init(server)
