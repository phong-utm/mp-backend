import http from "http"

import config from "./common/config"
import createApp from "./app"
import WebSocketDataPush from "./infrastructure/WebSocketDataPush"
import LocalPubSub from "./infrastructure/LocalPubSub"
import OperationalDAOFactoryImpl from "./infrastructure/operational-db/OperationalDAOFactoryImpl"

const { port, env } = config

const pubsub = new LocalPubSub()
const dataPush = new WebSocketDataPush()
const operationalDb = new OperationalDAOFactoryImpl()
const app = createApp(pubsub, dataPush, operationalDb)
const server = http.createServer(app).listen(port, () => {
  console.log(`Server listening on port ${port} in ${env} mode...`)
})
dataPush.init(server)
