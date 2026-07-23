import { SYNC_CLOSE_CODE } from '@/constants'

const handleDislikeAction = async (
  socket: LX.Socket,
  param: LX.Sync.Dislike.ActionList,
) => {
  const userName = socket.userInfo.name
  const { dislikeEvent, userSpace } = socket.context

  switch (param.action) {
    case 'dislike_data_overwrite':
      await dislikeEvent.dislike_data_overwrite(userName, param.data, true)
      break
    case 'dislike_music_add':
      await dislikeEvent.dislike_music_add(userName, param.data, true)
      break
    case 'dislike_music_clear':
      await dislikeEvent.dislike_music_clear(userName, true)
      break
    default:
      throw new Error('unknown dislike sync action')
  }

  return userSpace.dislikeManage.createSnapshot()
}

const handler: LX.Sync.ServerSyncHandlerDislikeActions<LX.Socket> = {
  async onDislikeSyncAction(socket, action) {
    if (!socket.moduleReadys?.dislike) return
    const key = await handleDislikeAction(socket, action)
    const userSpace = socket.context.userSpace
    await userSpace.dislikeManage.updateDeviceSnapshotKey(
      socket.keyInfo.clientId,
      key,
    )
    const currentUserName = socket.userInfo.name
    const currentId = socket.keyInfo.clientId
    socket.broadcast((client) => {
      if (
        client.keyInfo.clientId === currentId ||
        !client.moduleReadys?.dislike ||
        client.userInfo.name !== currentUserName
      )
        return
      void client.remoteQueueDislike
        .onDislikeSyncAction(action)
        .then(async () => {
          return userSpace.dislikeManage.updateDeviceSnapshotKey(
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
