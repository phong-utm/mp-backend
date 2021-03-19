import express from "express"
// import bodyParser from "body-parser"
import cors from "cors"

import createRouter from "./routes"
import DataPush from "./services/interfaces/DataPush"
import PubSub from "./services/interfaces/PubSub"
import TripsTracker from "./services/TripsTracker"
import RouteRepository from "./domain/interfaces/RouteRepository"

export default function createApp(
  pubsub: PubSub,
  dataPush: DataPush,
  routeRepo: RouteRepository
) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(createRouter(pubsub, routeRepo))

  const tripsTracker = new TripsTracker(pubsub, routeRepo)

  pubsub.onLocationUpdated((evt) => {
    dataPush.pushLocation(evt.tripId, evt.location)
  })

  pubsub.onLocationUpdated((evt) => {
    tripsTracker.updateLocation(evt.tripId, evt.location, evt.time)
    // mins = mins < 1 ? 20 : mins - 0.3
    // const eta = Math.round(mins)
    // dataPush.pushETAs(tripId, [
    //   { stop: "LRT Asia Jaya", minutes: eta },
    //   { stop: "SK Sri Petaling (Opp)", minutes: eta + 5 },
    // ])
  })

  return app
}
