import { Coordinates, LinkData, RouteData } from "./model"

class LinkProgress {
  constructor(
    readonly linkId: string,
    readonly startedAt: Date,
    readonly travelledTime: number,
    readonly travelledDistance: number,
    readonly remainingDistance: number,
    readonly isEnded: boolean
  ) {}

  get endedAt(): Date | undefined {
    return this.isEnded
      ? new Date(this.startedAt.getTime() + this.travelledTime)
      : undefined
  }
}

export default class TripProgress {
  // readonly currentLink: LinkProgress | null
  // readonly isEnded: boolean

  constructor(
    private routeData: RouteData,
    readonly currentLink: LinkProgress | null = null,
    readonly isEnded: boolean = false
  ) {}

  proceedTo(location: Coordinates, time: Date) {
    return !this.currentLink
      ? this.startTrip(time)
      : this.currentLink.isEnded
      ? this.proceedToNextLink(time)
      : this.proceedOnCurrentLink(location, time)
  }

  private startTrip(time: Date) {
    const linkProgress = new LinkProgress(
      this.routeData.links[0].id,
      time, // started at
      0, // travelled time
      0, // travelled distance
      this.routeData.links[0].length, // remaining distance
      false // is ended?
    )
    return new TripProgress(this.routeData, linkProgress)
  }

  // prettier-ignore
  private proceedOnCurrentLink(location: Coordinates, time: Date) {
    const linkData = this.getCurrentLinkData()!
    const travelledTime = time.getTime() - this.currentLink!.startedAt.getTime()
    const travelledDistance = calculateTravelledDistance(linkData, location)
    const remainingDistance = linkData.length - travelledDistance
    const isLinkEnded = isEndOfLink(linkData, location)
    const isTripEnded = isLinkEnded && this.isFinalLink()

    const linkProgress = new LinkProgress(
      this.currentLink!.linkId,
      this.currentLink!.startedAt,
      travelledTime,
      travelledDistance,
      remainingDistance,
      isLinkEnded
    )
    // prettier-ignore
    return new TripProgress(this.routeData, linkProgress, isTripEnded)
  }

  private proceedToNextLink(time: Date) {
    const nextLinkData = this.getNextLinkData()!
    const dwellTimeAtStop =
      time.getTime() - this.currentLink!.endedAt!.getTime()
    const linkProgress = new LinkProgress(
      nextLinkData.id,
      this.currentLink!.endedAt!, // startedAt,
      dwellTimeAtStop, // travelledTime
      0, // travelledDistance
      nextLinkData.length, // remainingDistance,
      false // isLinkEnded
    )
    return new TripProgress(this.routeData, linkProgress)
  }

  private getCurrentLinkData() {
    return this.routeData.links.find((l) => l.id === this.currentLink!.linkId)
  }

  private getNextLinkData() {
    const currentLinkIndex = this.routeData.links.findIndex(
      (l) => l.id === this.currentLink!.linkId
    )
    return currentLinkIndex < 0
      ? null
      : this.routeData.links[currentLinkIndex + 1]
  }

  private isFinalLink() {
    const finalLink = this.routeData.links[this.routeData.links.length - 1]
    return this.currentLink!.linkId === finalLink.id
  }
}

// =============== UTILITY FUNCTIONS ===============

function calculateTravelledDistance(link: LinkData, location: Coordinates) {
  const { points } = link
  let result = 0
  for (let i = 0; i < points.length; i++) {
    result += points[i].distFromPrev
    if (points[i].lat === location.lat && points[i].lng === location.lng) {
      return result
    }
  }

  return 0 // function should never reach this point
}

function isEndOfLink(link: LinkData, location: Coordinates) {
  const lastPoint = link.points[link.points.length - 1]
  return lastPoint.lat === location.lat && lastPoint.lng === location.lng
}
