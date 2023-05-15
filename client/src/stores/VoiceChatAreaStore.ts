import Peer from 'peerjs'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import ShareScreenManager from '../web/ShareScreenManager'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import { sanitizeId } from '../util'

interface VoiceChatAreaState {
  voiceChatAreaDialogOpen: boolean
  voiceChatAreaId: null | string
  myStream: null | MediaStream
  peerStreams: Map<
    string,
    {
      stream: MediaStream
      call: Peer.MediaConnection
    }
  >
  shareScreenManager: null | ShareScreenManager
}

const initialState: VoiceChatAreaState = {
  voiceChatAreaDialogOpen: false,
  voiceChatAreaId: null,
  myStream: null,
  peerStreams: new Map(),
  shareScreenManager: null,
}

export const voiceChatAreaSlice = createSlice({
  name: 'voiceChatArea',
  initialState,
  reducers: {


    openVoiceChatAreaDialog: (state, action: PayloadAction<{ voiceChatAreaId: string; myUserId: string }> ) => {
      if (!state.shareScreenManager) {
        state.shareScreenManager = new ShareScreenManager(action.payload.myUserId)
      }
      const game = phaserGame.scene.keys.game as Game
      game.disableKeys()
      state.shareScreenManager.onOpen()
      state.voiceChatAreaDialogOpen = true
      state.voiceChatAreaId = action.payload.voiceChatAreaId
    },
    closeVoiceChatAreaDialog: (state) => {
      // Tell server the voiceChatArea dialog is closed.
      const game = phaserGame.scene.keys.game as Game
      game.enableKeys()
      game.network.leaveVoiceChatArea(state.voiceChatAreaId!)
      for (const { call } of state.peerStreams.values()) {
        call.close()
      }
      state.shareScreenManager?.onClose()
      state.voiceChatAreaDialogOpen = false
      state.myStream = null
      state.voiceChatAreaId = null
      state.peerStreams.clear()
    },


    setMyStream: (state, action: PayloadAction<null | MediaStream>) => {
      state.myStream = action.payload
    },
    addVideoStream: (
      state,
      action: PayloadAction<{ id: string; call: Peer.MediaConnection; stream: MediaStream }>
    ) => {
      state.peerStreams.set(sanitizeId(action.payload.id), {
        call: action.payload.call,
        stream: action.payload.stream,
      })
    },
    removeVideoStream: (state, action: PayloadAction<string>) => {
      state.peerStreams.delete(sanitizeId(action.payload))
    },
  },
})

export const {
  closeVoiceChatAreaDialog,
  openVoiceChatAreaDialog,
  setMyStream,
  addVideoStream,
  removeVideoStream,
} = voiceChatAreaSlice.actions

export default voiceChatAreaSlice.reducer
