import http from "http"

import config from "./common/config"
import createApp from "./app"
import WebSocketDataPush from "./infrastructure/WebSocketDataPush"
import LocalPubSub from "./infrastructure/LocalPubSub"
import MysqlOperationalDbContext from "./infrastructure/operational-db/MysqlOperationalDbContext"
import MysqlAnalyticsDbContext from "./infrastructure/analytics-db/MysqlAnalyticsDbContext"

const { port, env } = config

const pubsub = new LocalPubSub()
const dataPush = new WebSocketDataPush()
const operationalDb = new MysqlOperationalDbContext()
const analyticsDb = new MysqlAnalyticsDbContext()

Promise.all([operationalDb.sync(), analyticsDb.sync()])
  .then(() => {
    const app = createApp(pubsub, dataPush, operationalDb, analyticsDb)
    const server = http.createServer(app).listen(port, () => {
      console.log(`Server listening on port ${port} in ${env} mode...`)
    })
    dataPush.init(server)
  })
  .catch(console.error)
