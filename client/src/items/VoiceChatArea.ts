import { ItemType } from '../../../types/Items'
import store from '../stores'
import Item from './Item'
import Network from '../services/Network'
import { openComputerDialog } from '../stores/ComputerStore'
import Player from '../characters/Player'

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
    this.makeCall(player)
  }

  makeCall(newPlayer: Player) {
    //  newUserIdのユーザーを，すでにいるユーザー全員と通話開始させる
    if (this.currentUsers.size >= 2) {
      // TODO: 通話開始

      // NOTE: Game.otherPlayers から自分以外のplayerを取得できそう
    }
  }

  addCurrentUser(userId: string) {
    if (!this.currentUsers || this.currentUsers.has(userId)) return
    this.currentUsers.add(userId)
    const computerState = store.getState().computer
    if (computerState.computerId === this.id) {
      computerState.shareScreenManager?.onUserJoined(userId)
    }
    this.updateStatus()
  }

  removeCurrentUser(userId: string) {
    if (!this.currentUsers || !this.currentUsers.has(userId)) return
    this.currentUsers.delete(userId)
    const computerState = store.getState().computer
    if (computerState.computerId === this.id) {
      computerState.shareScreenManager?.onUserLeft(userId)
    }
    this.updateStatus()
  }

  openDialog(playerId: string, network: Network) {
    if (!this.id) return
    store.dispatch(openComputerDialog({ computerId: this.id, myUserId: playerId }))
    network.connectToComputer(this.id)
  }
}
