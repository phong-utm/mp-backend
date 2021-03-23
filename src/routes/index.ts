import express from "express"

import PubSub, { LocationUpdatedEvent } from "../services/interfaces/PubSub"
import OperationalDbContext from "../services/interfaces/dao/OperationalDbContext"
import TripsTracker from "../services/TripsTracker"

export default function createRouter(
  tripsTracker: TripsTracker,
  pubsub: PubSub,
  operationalDb: OperationalDbContext
) {
  const router = express.Router()

  router.get("/routes/:route", async function (req, res) {
    const routeId = req.params["route"]
    const routeData = await operationalDb.getRouteDAO().findById(routeId)
    if (!routeData) {
      res.sendStatus(404)
    } else {
      res.send(routeData)
    }
  })

  router.post("/trip", async function (req, res) {
    const routeId = req.query["route"]!.toString()
    const scheduledStart = req.query["start"]!.toString()
    const dayId = parseInt(req.query["day"]!.toString())

    const tripId = await tripsTracker.startTrip({
      routeId,
      dayId,
      scheduledStart,
    })

    res.send({ tripId })
  })

  router.post("/location/:tripId", function (req, res) {
    const tripId = req.params["tripId"]
    const { location, time } = req.body
    const dTime = new Date(parseInt(time))
    const event = new LocationUpdatedEvent(tripId, location, dTime)
    pubsub.publishLocationUpdated(event)
    res.sendStatus(200)
  })

  return router
}
