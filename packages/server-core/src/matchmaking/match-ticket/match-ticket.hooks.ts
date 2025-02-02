import { disallow, iff, isProvider } from 'feathers-hooks-common'

import matchmakingRemoveTicket from '@etherealengine/server-core/src/hooks/matchmaking-remove-ticket'
import matchmakingRestrictMultipleQueueing from '@etherealengine/server-core/src/hooks/matchmaking-restrict-multiple-queueing'
import matchmakingSaveTicket from '@etherealengine/server-core/src/hooks/matchmaking-save-ticket'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'

import authenticate from '../../hooks/authenticate'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [],
    find: [],
    get: [iff(isProvider('external'), authenticate() as any, setLoggedInUser('userId') as any)],
    create: [
      iff(isProvider('external'), authenticate() as any, setLoggedInUser('userId') as any),
      matchmakingRestrictMultipleQueueing()
      // addUUID()
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external'))]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [matchmakingSaveTicket()],
    update: [],
    patch: [],
    remove: [matchmakingRemoveTicket()]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
