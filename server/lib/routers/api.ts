import type { Router, Request, Response, NextFunction } from 'express'
import { videoHasWebchat } from '../../../shared/lib/video'

// See here for description: https://modules.prosody.im/mod_muc_http_defaults.html
interface RoomDefaults {
  config: {
    name: string
    description: string
    // language: string
    // persistent: boolean
    public: boolean
    // members_only: boolean
    // allow_member_invites: boolean
    // public_jids: boolean
    subject: string
    // changesubject: boolean
    // // historylength: number
    // moderated: boolean
    // archiving: boolean
  }
  affiliations?: Array<{
    jid: string
    affiliation: 'outcast' | 'none' | 'member' | 'admin' | 'owner'
    nick?: string
  }>
}

async function initApiRouter (options: RegisterServerOptions): Promise<Router> {
  const { peertubeHelpers, getRouter } = options
  const router = getRouter()
  const logger = peertubeHelpers.logger

  router.get('/room', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jid: string = req.query.jid as string || ''
      logger.info(`Requesting room information for room '${jid}'.`)

      const video = await peertubeHelpers.videos.loadByIdOrUUID(jid)
      if (!video) {
        throw new Error('Video not found')
      }
      // check settings (chat enabled for this video?)
      const settings = await options.settingsManager.getSettings([
        'chat-only-locals',
        'chat-all-lives',
        'chat-all-non-lives',
        'chat-videos-list'
      ])
      if (!videoHasWebchat({
        'chat-only-locals': settings['chat-only-locals'] as boolean,
        'chat-all-lives': settings['chat-all-lives'] as boolean,
        'chat-all-non-lives': settings['chat-all-non-lives'] as boolean,
        'chat-videos-list': settings['chat-videos-list'] as string
      }, video)) {
        throw new Error('Chat is not activated for this video')
      }

      // TODO: fill missing informations
      const roomDefaults: RoomDefaults = {
        config: {
          name: video.name,
          description: '',
          public: false,
          subject: video.name
        },
        affiliations: [] // so that the first user will not be moderator/admin
      }
      res.json(roomDefaults)
    } catch (error) {
      next(error)
    }
  })

  return router
}

export {
  initApiRouter
}
