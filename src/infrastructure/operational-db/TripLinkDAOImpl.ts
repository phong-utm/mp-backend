import TripLinkDAO from "../../services/interfaces/dao/TripLinkDAO"
import { TripLink } from "../../domain/model"
import { TripLinkDbModel } from "./models/TripLinkDbModel"
export default class TripLinkDAOImpl implements TripLinkDAO {
  constructor(private TripLinkModel: TripLinkDbModel) {}

  async add(record: TripLink) {
    const { tripId, linkId, travelledTime } = record
    console.log(`${linkId} travelled time: ${travelledTime!}`)
    await this.TripLinkModel.create({
      tripId,
      linkId,
      travelledTime: travelledTime!,
    })
  }
}
