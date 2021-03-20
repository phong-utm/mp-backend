import TripLinkDAO from "../../services/interfaces/dao/TripLinkDAO"
import { TripLink } from "../../domain/model"
import { TripLinkSequelizeModel } from "./models/TripLink"
export default class TripLinkDAOImpl implements TripLinkDAO {
  constructor(private TripLinkModel: TripLinkSequelizeModel) {}

  async add(record: TripLink) {
    const { tripId, linkId, travelledTime } = record
    console.log(`${linkId} travelled time: ${travelledTime!}`)
    await this.TripLinkModel.create({
      tripId: tripId.tripId,
      linkId,
      travelledTime: travelledTime!,
    })
  }
}
