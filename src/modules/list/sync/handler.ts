import { SYNC_CLOSE_CODE } from '@/constants'

const handleListAction = async (
  socket: LX.Socket,
  { action, data }: LX.Sync.List.ActionList,
) => {
  const userName = socket.userInfo.name
  const { listEvent, userSpace } = socket.context

  switch (action) {
    case 'list_data_overwrite':
      await listEvent.list_data_overwrite(userName, data, true)
      break
    case 'list_create':
      await listEvent.list_create(
        userName,
        data.position,
        data.listInfos,
        true,
      )
      break
    case 'list_remove':
      await listEvent.list_remove(userName, data, true)
      break
    case 'list_update':
      await listEvent.list_update(userName, data, true)
      break
    case 'list_update_position':
      await listEvent.list_update_position(
        userName,
        data.position,
        data.ids,
        true,
      )
      break
    case 'list_music_add':
      await listEvent.list_music_add(
        userName,
        data.id,
        data.musicInfos,
        data.addMusicLocationType,
        true,
      )
      break
    case 'list_music_move':
      await listEvent.list_music_move(
        userName,
        data.fromId,
        data.toId,
        data.musicInfos,
        data.addMusicLocationType,
        true,
      )
      break
    case 'list_music_remove':
      await listEvent.list_music_remove(
        userName,
        data.listId,
        data.ids,
        true,
      )
      break
    case 'list_music_update':
      await listEvent.list_music_update(userName, data, true)
      break
    case 'list_music_update_position':
      await listEvent.list_music_update_position(
        userName,
        data.listId,
        data.position,
        data.ids,
        true,
      )
      break
    case 'list_music_overwrite':
      await listEvent.list_music_overwrite(
        userName,
        data.listId,
        data.musicInfos,
        true,
      )
      break
    case 'list_music_clear':
      await listEvent.list_music_clear(userName, data, true)
      break
    default:
      throw new Error('unknown list sync action')
  }

  return userSpace.listManage.createSnapshot()
}

const handler: LX.Sync.ServerSyncHandlerListActions<LX.Socket> = {
  async onListSyncAction(socket, action) {
    if (!socket.moduleReadys?.list) return
    const key = await handleListAction(socket, action)
    const userSpace = socket.context.userSpace
    await userSpace.listManage.updateDeviceSnapshotKey(
      socket.keyInfo.clientId,
      key,
    )
    const currentUserName = socket.userInfo.name
    const currentId = socket.keyInfo.clientId
    socket.broadcast((client) => {
      if (
        client.keyInfo.clientId === currentId ||
        !client.moduleReadys?.list ||
        client.userInfo.name !== currentUserName
      )
        return
      void client.remoteQueueList
        .onListSyncAction(action)
        .then(async () => {
          return userSpace.listManage.updateDeviceSnapshotKey(
            client.keyInfo.clientId,
            key,
          )
        })
        .catch((err) => {
          client.close(SYNC_CLOSE_CODE.failed)
          console.error(err.message)
        })
    })
  },
}

export default handler
