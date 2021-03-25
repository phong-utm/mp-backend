import express from "express"
import cors from "cors"

import createRouter from "./routes"
import DataPush from "./services/interfaces/DataPush"
import PubSub from "./services/interfaces/PubSub"
import TripsTracker from "./services/TripsTracker"
import OperationalDbContext from "./services/interfaces/dao/OperationalDbContext"
import TravelTimeEstimator from "./services/TravelTimeEstimator"
import { getDayId } from "./common/helpers"

export default function createApp(
  pubsub: PubSub,
  dataPush: DataPush,
  operationalDb: OperationalDbContext
) {
  const tripsTracker = new TripsTracker(pubsub, operationalDb)
  const travelTimeEst = new TravelTimeEstimator()

  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(createRouter(tripsTracker, pubsub, operationalDb))

  pubsub.onLocationUpdated((evt) => {
    dataPush.pushLocation(evt.tripId, evt.location)
  })

  pubsub.onLocationUpdated((evt) => {
    tripsTracker
      .updateLocation(evt.tripId, evt.location, evt.time)
      .catch(console.error)
    // mins = mins < 1 ? 20 : mins - 0.3
    // const eta = Math.round(mins)
    // dataPush.pushETAs(tripId, [
    //   { stop: "LRT Asia Jaya", minutes: eta },
    //   { stop: "SK Sri Petaling (Opp)", minutes: eta + 5 },
    // ])
  })

  pubsub.onTripStarted((evt) => {
    const { tripId, info } = evt

    // don't estimate travel time when generating historical data
    // as previous trips' data might not be available yet
    const todayId = getDayId(new Date())
    if (info.dayId === todayId) {
      travelTimeEst.estimateForTrip(tripId).catch(console.error)
    }
  })

  return app
}
