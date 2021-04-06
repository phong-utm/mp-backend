import express from "express"

import PubSub from "../services/interfaces/PubSub"
import OperationalDbContext from "../services/interfaces/dao/OperationalDbContext"
import TripTracker from "../services/TripTracker"

export default function createRouter(
  tripTracker: TripTracker,
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
      res.send({
        ...routeData,
        drivers: [...Array(4)].map((_, index) => `${routeId}${index + 1}`),
        centerLocation: { lat: 3.2177884212938914, lng: 101.58162463363506 },
      })
    }
  })

  router.post("/trip", async function (req, res) {
    const routeId = req.query["route"]!.toString()
    const scheduledStart = req.query["start"]!.toString()
    const dayId = parseInt(req.query["day"]!.toString())
    const driver = req.query["driver"]!.toString()

    const tripId = await tripTracker.startTrip({
      routeId,
      dayId,
      scheduledStart,
      driver,
    })

    res.send({ tripId })
  })

  router.post("/location/:tripId", function (req, res) {
    const tripId = req.params["tripId"]
    const { location, time } = req.body
    pubsub.publishLocationUpdated({
      tripId,
      location,
      time: new Date(parseInt(time)),
    })
    res.sendStatus(200)
  })

  return router
}
