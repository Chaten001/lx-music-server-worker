import type { DislikeEvent } from '@/modules/dislike/event'
import type { ListEvent } from '@/modules/list/event'
import type { UserSpace } from '@/user'

/**
 * Per-Durable-Object synchronization dependencies.
 *
 * This object is created once for each UserSyncDO instance and attached to
 * sockets created by that instance. It must never be stored in module-global
 * state because multiple Durable Object instances may share one Worker isolate.
 */
export interface SyncContext {
  readonly userSpace: UserSpace
  readonly listEvent: ListEvent
  readonly dislikeEvent: DislikeEvent
}
