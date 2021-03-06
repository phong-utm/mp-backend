import PubSub from "./interfaces/PubSub"
import TripProgress from "../domain/TripProgress"
import {
  Coordinates,
  RouteData,
  TripLink,
  TripLinkSchedule,
} from "../domain/model"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"
import RouteDAO from "./interfaces/dao/RouteDAO"
import TripDAO from "./interfaces/dao/TripDAO"
import TripLinkDAO from "./interfaces/dao/TripLinkDAO"
import TripLinkScheduleDAO from "./interfaces/dao/TripLinkScheduleDAO"

const generateGUID = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)

export default class TripTracker {
  private tripProgressById = new Map<string, TripProgress>()
  private prevTripById = new Map<string, TripLink[]>()
  private routeDao: RouteDAO
  private tripDao: TripDAO
  private tripLinkDao: TripLinkDAO
  private tripLinkScheduleDao: TripLinkScheduleDAO

  constructor(private pubsub: PubSub, operationalDb: OperationalDbContext) {
    this.routeDao = operationalDb.getRouteDAO()
    this.tripDao = operationalDb.getTripDAO()
    this.tripLinkDao = operationalDb.getTripLinkDAO()
    this.tripLinkScheduleDao = operationalDb.getTripLinkScheduleDAO()
  }

  async startTrip(info: {
    routeId: string
    scheduledStart: string
    dayId: number
    driver: string
  }) {
    const { routeId, scheduledStart, dayId, driver } = info
    const routeData = await this.routeDao.findById(routeId)
    if (!routeData) {
      throw new Error(`Data not found for route ${routeId}.`)
    }
    const tripInfo = { ...info, routeData }

    // create new trip
    const tripId = generateGUID()
    await this.tripDao.add({ tripId, routeId, scheduledStart, dayId, driver })
    await this.tripLinkScheduleDao.add(calculateTripSchedule(tripId, tripInfo))

    // start tracking trip's progress
    const progress = new TripProgress(routeData)
    this.tripProgressById.set(tripId, progress)

    // prettier-ignore
    const prevTrip = await this.tripLinkDao.forPrevTripSameDay(routeId, scheduledStart, dayId)
    this.prevTripById.set(tripId, prevTrip)

    // emit event
    this.pubsub.publishTripStarted({ tripId, info: tripInfo })

    return tripId
  }

  async updateLocation(tripId: string, location: Coordinates, time: Date) {
    const prevProgress = this.tripProgressById.get(tripId)
    if (!prevProgress) {
      throw new Error(`No progress found for trip ${tripId}.`)
    }

    const progress = prevProgress.proceedTo(location, time)
    this.tripProgressById.set(tripId, progress)

    if (progress.currentLink!.isEnded) {
      const { linkId, travelledTime } = progress.currentLink!
      const prevArrival = getArrivedAt(this.prevTripById.get(tripId)!, linkId)
      await this.tripLinkDao.add({
        tripId,
        linkId,
        travelledTime: Math.round(travelledTime / 1000),
        arrivedAt: time,
        headway: calculateHeadway(time, prevArrival),
      })

      if (progress.isEnded) {
        this.tripProgressById.delete(tripId)
        this.prevTripById.delete(tripId)

        this.pubsub.publishTripEnded({
          tripId,
          timestamp: time.getTime(),
        })
      }
    } else {
      const { linkId, travelledTime, remainingDistance } = progress.currentLink!
      this.pubsub.publishMidLink({
        tripId,
        linkId,
        linkTravelledTime: travelledTime,
        linkRemainingDistance: remainingDistance,
        timestamp: time.getTime(),
      })
    }
  }

  async cleanUp() {
    const tripsInProgress = this.tripProgressById.keys()
    for (const tripId of tripsInProgress) {
      console.log(`[INFO] Removing incomplete trip ${tripId}...`)
      this.tripProgressById.delete(tripId)
      this.prevTripById.delete(tripId)
      this.pubsub.publishTripCancelled({ tripId })
      await this.tripDao.delete(tripId)
      console.log(`[INFO] Incomplete trip ${tripId} was removed.`)
    }
  }
}

function calculateTripSchedule(
  tripId: string,
  tripInfo: {
    routeData: RouteData
    scheduledStart: string
    dayId: number
  }
) {
  const {
    routeData: { links },
    scheduledStart,
    dayId,
  } = tripInfo

  const result: TripLinkSchedule[] = []
  let scheduledArrival = parseTripStart(dayId, scheduledStart).getTime()
  for (let i = 0; i < links.length; i++) {
    scheduledArrival += links[i].baseDuration * 1000
    result.push({
      tripId,
      linkId: links[i].id,
      scheduledArrival: new Date(scheduledArrival),
    })
  }

  return result
}

function parseTripStart(dayId: number, scheduledStart: string): Date {
  const monthAndDate = dayId % 10000
  const year = (dayId - monthAndDate) / 10000
  const date = monthAndDate % 100
  const month = (monthAndDate - date) / 100
  const hours = parseInt(scheduledStart.substr(0, 2))
  const minutes = parseInt(scheduledStart.substr(3, 2))
  return new Date(year, month - 1, date, hours, minutes)
}

function getArrivedAt(prevTrip: TripLink[], linkId: string) {
  const tripLinks = prevTrip.filter((t) => t.linkId === linkId)
  return tripLinks.length > 0 ? tripLinks[0].arrivedAt : undefined
}

function calculateHeadway(arrival: Date, prevArrival: Date | undefined) {
  return prevArrival
    ? Math.round((arrival.getTime() - prevArrival.getTime()) / 1000)
    : null
}
