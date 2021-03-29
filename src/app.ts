import express from "express"
import cors from "cors"

import createRouter from "./routes"
import DataPush from "./services/interfaces/DataPush"
import PubSub from "./services/interfaces/PubSub"
import TripsTracker from "./services/TripsTracker"
import OperationalDbContext from "./services/interfaces/dao/OperationalDbContext"
import ArrivalTimeCalculator from "./services/ArrivalTimeCalculator"
import { getDayId } from "./common/helpers"

export default function createApp(
  pubsub: PubSub,
  dataPush: DataPush,
  operationalDb: OperationalDbContext
) {
  const tripsTracker = new TripsTracker(pubsub, operationalDb)
  const arrivalTimeCalculator = new ArrivalTimeCalculator(operationalDb)

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
  })

  pubsub.onTripStarted((evt) => {
    const { tripId, info } = evt

    // don't estimate travel time when generating historical data
    const todayId = getDayId(new Date())
    if (info.dayId === todayId) {
      arrivalTimeCalculator.startTrip(tripId, info).catch(console.error)
    }
  })

  pubsub.onMidLink((evt) => {
    const {
      tripId,
      linkId,
      linkTravelledTime,
      linkRemainingDistance,
      timestamp: eventTime,
    } = evt

    // no need to estimate bus arrival time when generating historical data
    if (Date.now() - eventTime < 1000) {
      const etas = arrivalTimeCalculator.calculate(
        tripId,
        linkId,
        linkTravelledTime,
        linkRemainingDistance
      )

      dataPush.pushETAs(tripId, etas)
    }
  })

  pubsub.onTripEnded((evt) => {
    const { tripId, timestamp: eventTime } = evt
    // no need to estimate bus arrival time when generating historical data
    if (Date.now() - eventTime < 1000) {
      arrivalTimeCalculator.endTrip(tripId)
      dataPush.pushETAs(tripId, [])
    }
  })

  return app
}
