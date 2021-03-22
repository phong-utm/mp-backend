import Coordinates from "./Coordinates"

export default interface RouteData {
  origin: string
  destination: string
  links: LinkData[]
}

export interface LinkData {
  id: string
  from: string
  to: string
  points: LinkPointData[]
  length: number
  baseDuration: number
}

type LinkPointData = Coordinates & {
  distFromPrev: number
}
