import { Server as HttpServer } from "http"
import { Server } from "ws"

import { Coordinates, ETA } from "../domain/model"
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

  pushLocation(tripId: string, location: Coordinates) {
    this.pushData({ location })
  }

  pushETAs(tripId: string, arrival: ETA[]) {
    this.pushData({ arrival })
  }

  private pushData(data: any) {
    const msg = JSON.stringify(data)
    this.wss?.clients.forEach((client) => client.send(msg))
  }
}
