import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendMessage(data);
    // Broadcast to relevant room (guild/friend)
    if (message.type === 'GUILD') {
      this.server.to(`guild_${message.guildId}`).emit('newMessage', message);
    } else if (message.type === 'FRIEND') {
      this.server.to(`friend_${message.friendId}`).emit('newMessage', message);
    }
    return message;
  }

  @SubscribeMessage('joinGuild')
  handleJoinGuild(
    @MessageBody() guildId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`guild_${guildId}`);
  }

  @SubscribeMessage('joinFriend')
  handleJoinFriend(
    @MessageBody() friendId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`friend_${friendId}`);
  }
}
