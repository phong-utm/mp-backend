import TripLinkEstimateDAO from "./interfaces/dao/TripLinkEstimateDAO"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"
import { TripLinkEstimate, ETA, LinkData, RouteData } from "../domain/model"
import TravelTimeEstimator from "./TravelTimeEstimator"

export default class ArrivalTimeCalculator {
  private calculatorByTrip = new Map<string, Calculator>()
  private travelTimeEstimator: TravelTimeEstimator
  private tripLinkEstimateDao: TripLinkEstimateDAO

  constructor(operationalDb: OperationalDbContext) {
    this.travelTimeEstimator = new TravelTimeEstimator(operationalDb)
    this.tripLinkEstimateDao = operationalDb.getTripLinkEstimateDAO()
  }

  async startTrip(
    tripId: string,
    info: {
      routeId: string
      scheduledStart: string
      dayId: number
      routeData: RouteData
    }
  ) {
    // prettier-ignore
    const estTravelTimes = await this.travelTimeEstimator.estimateForTrip(tripId, info)
    this.tripLinkEstimateDao.add(estTravelTimes).catch(console.error)

    const calculator = new Calculator(info.routeData, estTravelTimes)
    this.calculatorByTrip.set(tripId, calculator)
  }

  calculate(
    tripId: string,
    linkId: string,
    linkTravelledTime: number,
    linkRemainingDistance: number
  ) {
    const calculator = this.calculatorByTrip.get(tripId)
    return calculator
      ? calculator.calculate(linkId, linkTravelledTime, linkRemainingDistance)
      : []
  }

  endTrip(tripId: string) {
    this.calculatorByTrip.delete(tripId)
  }
}

class Calculator {
  private estTravelTimeByLink: Map<string, number>

  constructor(
    private routeData: RouteData,
    estTravelTimes: TripLinkEstimate[]
  ) {
    this.estTravelTimeByLink = new Map<string, number>(
      estTravelTimes.map((est) => [est.linkId, est.estimatedTime])
    )
  }

  calculate(
    linkId: string,
    linkTravelledTime: number,
    linkRemainingDistance: number
  ) {
    const result: ETA[] = []
    const { links } = this.routeData

    let i = 0
    while (links[i].id !== linkId) i++ // ignore links that we already passed

    // prettier-ignore
    let est = this.calculateRemainingTimeForCurrentLink(links[i], linkTravelledTime, linkRemainingDistance)
    result.push({ stop: links[i].to, seconds: est })
    i++

    // subsequent links
    while (i < links.length) {
      est += this.getLinkEst(links[i].id)
      result.push({ stop: links[i].to, seconds: est })
      i++
    }

    return result
  }

  private calculateRemainingTimeForCurrentLink(
    link: LinkData,
    travelledTime: number,
    remainingDistance: number
  ) {
    const estTravelTime = this.getLinkEst(link.id)
    const baseTravelTime = Math.round(
      (remainingDistance / link.length) * link.baseDuration
    )
    const remainingTravelTime =
      travelledTime < estTravelTime
        ? estTravelTime - travelledTime
        : baseTravelTime
    return remainingTravelTime
  }

  private getLinkEst(linkId: string) {
    const est = this.estTravelTimeByLink.get(linkId)
    if (est === undefined) {
      throw new Error(`Estimated travel time not found for link ${linkId}.`)
    }
    return est
  }
}
