import { TripLink } from "../../domain/model"
import TripLinkDAO from "../../services/interfaces/dao/TripLinkDAO"

export default class TripLinkDAOImpl implements TripLinkDAO {
  async add(record: TripLink) {
    const { linkId, travelledTime } = record
    console.log(`${linkId} travelled time: ${travelledTime! / 1000}`)
  }
}
