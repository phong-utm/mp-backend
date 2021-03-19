import { Server as HttpServer } from "http"
import { Server } from "ws"

import { TripId, Coordinates, ETA } from "../domain/model"
import DataPush from "../services/interfaces/DataPush"

export default class WebSocketDataPush implements DataPush {
  private wss: Server | undefined

  init(server: HttpServer) {
    this.wss = new Server({ server })
    this.wss.on("connection", (ws) => {
      console.log("Client connected")
      ws.on("close", () => console.log("Client disconnected"))
    })
  }

  pushLocation(tripId: TripId, location: Coordinates) {
    this.pushData({ location })
  }

  pushETAs(tripId: TripId, arrival: ETA[]) {
    this.pushData({ arrival })
  }

  private pushData(data: any) {
    const msg = JSON.stringify(data)
    this.wss?.clients.forEach((client) => client.send(msg))
  }
}
