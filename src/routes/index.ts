import express from "express"

import PubSub from "../services/interfaces/PubSub"
import OperationalDbContext from "../services/interfaces/dao/OperationalDbContext"
import TripTracker from "../services/TripTracker"
import ServiceAnalyzer from "../services/ServiceAnalyzer"

export default function createRouter(
  tripTracker: TripTracker,
  serviceAnalyzer: ServiceAnalyzer,
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

  router.post("/analytics", async function (req, res) {
    if (req.query["month"]) {
      const monthId = parseInt(req.query["month"].toString())
      const result = await serviceAnalyzer.processMonth(monthId)
      res.send(result)
    } else if (req.query["period"]) {
      const period = req.query["period"].toString()
      const result = await serviceAnalyzer.processPeriod(period)
      res.send(result)
    } else {
      res.sendStatus(400)
    }
  })

  router.post("/cleanup", async function (req, res) {
    await tripTracker.cleanUp()
    res.sendStatus(200)
  })

  // for cleaning up test data
  router.delete("/trip", async function (req, res) {
    const tripDao = operationalDb.getTripDAO()
    if (req.query["month"]) {
      const monthId = parseInt(req.query["month"].toString())
      await tripDao.deleteForMonth(monthId)
    } else if (req.query["period"]) {
      const period = req.query["period"].toString()
      await tripDao.deleteForPeriod(period)
    } else if (req.query["trip"]) {
      const tripId = req.query["trip"].toString()
      await tripDao.delete(tripId)
    } else {
      return res.sendStatus(400)
    }
    return res.sendStatus(200)
  })

  return router
}
