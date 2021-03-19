import express from "express"

import { TripId } from "../domain/model"
import PubSub, { LocationUpdatedEvent } from "../services/interfaces/PubSub"
import OperationalDAOFactory from "../services/interfaces/dao/OperationalDAOFactory"

export default function createRouter(
  pubsub: PubSub,
  operationalDb: OperationalDAOFactory
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

  router.post("/location/:route/:trip", function (req, res) {
    const tripId = TripId.getInstance(req.params["route"], req.params["trip"])
    const { location, time } = req.body
    const dTime = new Date(parseInt(time))
    const event = new LocationUpdatedEvent(tripId, location, dTime)
    pubsub.publishLocationUpdated(event)
    res.sendStatus(200)
  })

  return router
}
