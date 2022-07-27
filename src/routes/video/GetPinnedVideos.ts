import Path from '../../base/Path'
import {
  HttpReq,
  IRoute
} from '../../types/Http'

// TODO: Remove this, replace with GetVideos new features (soon).
class GetPinnedVideos extends Path implements IRoute {
  public path   = '/api/videos/pinned'
  public method = 'get'

  public async onRequest() {
    const videos = await this.server.utils.getPinnedVideos()

    return {
      data: videos,
      code: 200
    }
  }
}

export default GetPinnedVideos