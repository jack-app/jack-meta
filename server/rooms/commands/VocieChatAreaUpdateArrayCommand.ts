import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'

type Payload = {
  client: Client
  voiceChatAreaId: string
}

export class VoiceChatAreaAddUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, voiceChatAreaId } = data
    const voiceChatArea = this.room.state.voiceChatAreas.get(voiceChatAreaId)
    const clientId = client.sessionId

    if (!voiceChatArea || voiceChatArea.connectedUser.has(clientId)) return
    voiceChatArea.connectedUser.add(clientId)
  }
}

export class VoiceChatAreaRemoveUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, voiceChatAreaId } = data
    const voiceChatArea = this.state.voiceChatAreas.get(voiceChatAreaId)

    if (voiceChatArea?.connectedUser.has(client.sessionId)) {
      voiceChatArea?.connectedUser.delete(client.sessionId)
    }
  }
}
