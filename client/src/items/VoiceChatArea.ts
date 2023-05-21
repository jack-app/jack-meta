import { ItemType } from '../../../types/Items'
import store from '../stores'
import Item from './Item'
import Network from '../services/Network'
import { openVoiceChatAreaDialog } from '../stores/VoiceChatAreaStore'
import Player from '../characters/Player'
import OtherPlayer from '../characters/OtherPlayer'
import WebRTC from '../web/WebRTC'

export default class VoiceChatArea extends Item {
  id?: string
  currentUsers = new Set<string>()

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)

    this.itemType = ItemType.VOICECHATAREA
  }

  private updateStatus() {
    if (!this.currentUsers) return
    const numberOfUsers = this.currentUsers.size
    this.clearStatusBox()
    if (numberOfUsers === 1) {
      this.setStatusBox(`${numberOfUsers} user`)
    } else if (numberOfUsers > 1) {
      this.setStatusBox(`${numberOfUsers} users`)
    }
  }

  onOverlapDialog() {
    if (this.currentUsers.size === 0) {
      this.setDialogBox('Press R to start screen sharing')
    } else {
      this.setDialogBox('Press R join')
    }
  }

  onEnteredVoiceChatArea(player: Player) {
    console.log('Entering voice chat area')
    this.addCurrentUser(player.playerId)
    console.log(this.currentUsers)
  }

  makeCall(newPlayer: Player, otherPlayerMap: Map<string, OtherPlayer>, webRTC: WebRTC) {
    //  newUserIdのユーザーを，すでにいるユーザー全員と通話開始させる
    console.log(this.currentUsers)
    if (this.currentUsers.size >= 2) {
      // 通話開始処理
      // NOTE: うまくいかない
      // currentUsersがユーザー間で同期されないのが原因のひとつ．
      // どこかでサーバーとやり取りする必要がある?
      // もしくは，client/src/stores/にファイル作って，そこでやりとりする必要がある?
      const newPlayerId = newPlayer.playerId
      console.log("new: " + newPlayerId)
      for (const otherPlayerId of this.currentUsers) {
        const otherPlayer = otherPlayerMap.get(otherPlayerId)
        console.log("other: " + otherPlayerId)
        if (
          otherPlayer &&
          !otherPlayer.connected &&
          otherPlayer.connectionBufferTime >= 750 &&
          newPlayer.readyToConnect &&
          otherPlayer.readyToConnect &&
          newPlayerId > otherPlayer.playerId
          ) {
            console.log("connecting")
            webRTC.connectToNewUser(otherPlayerId)
            otherPlayer.connected = true
            otherPlayer.connectionBufferTime = 0
            console.log("connected!!")
          }
      }
    }
  }

  addCurrentUser(userId: string) {
    if (!this.currentUsers || this.currentUsers.has(userId)) return
    this.currentUsers.add(userId)
    const voiceChatAreaState = store.getState().voiceChatArea
    if (voiceChatAreaState.voiceChatAreaId === this.id) {
      voiceChatAreaState.shareScreenManager?.onUserJoined(userId)
    }
    this.updateStatus()
  }

  removeCurrentUser(userId: string) {
    if (!this.currentUsers || !this.currentUsers.has(userId)) return
    this.currentUsers.delete(userId)
    const voiceChatAreaState = store.getState().voiceChatArea
    if (voiceChatAreaState.voiceChatAreaId === this.id) {
      voiceChatAreaState.shareScreenManager?.onUserLeft(userId)
    }
    this.updateStatus()
  }

  openDialog(playerId: string, network: Network) {
    console.log("open dialog");
    // よくわからなかったから，一旦コメントアウトしておく
    if (!this.id) return
    // store.dispatch(openVoiceChatAreaDialog({ voiceChatAreaId: this.id, myUserId: playerId }))
    network.enterVoiceChatArea(this.id)
  }
}
