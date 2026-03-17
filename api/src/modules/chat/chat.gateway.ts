import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ALLOW_URL?.split(',') || '*',
        credentials: true,
    },
    namespace: 'chat',
})
export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    constructor(private chatService: ChatService) { }

    afterInit(server: Server) {
        this.logger.log('WebSocket Chat Gateway initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join-conversation')
    async handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: number; userId: number },
    ) {
        const room = `conversation-${data.conversationId}`;
        client.join(room);
        this.logger.log(
            `User ${data.userId} joined conversation ${data.conversationId}`,
        );
        this.server.to(room).emit('user-joined', { userId: data.userId });
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        data: {
            conversationId: number;
            senderId: number;
            content: string;
            attachment?: string;
        },
    ) {
        try {
            const message = await this.chatService.createMessage(
                data.conversationId,
                data.senderId,
                data.content,
                data.attachment,
            );

            const room = `conversation-${data.conversationId}`;
            this.server.to(room).emit('new-message', message);
            this.logger.log(
                `Message sent in conversation ${data.conversationId}`,
            );
        } catch (error) {
            this.logger.error('Error sending message:', error);
            client.emit('error', { message: 'Failed to send message' });
        }
    }

    @SubscribeMessage('typing')
    async handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: number; userId: number },
    ) {
        const room = `conversation-${data.conversationId}`;
        this.server.to(room).emit('user-typing', { userId: data.userId });
    }

    @SubscribeMessage('stop-typing')
    async handleStopTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: number; userId: number },
    ) {
        const room = `conversation-${data.conversationId}`;
        this.server.to(room).emit('user-stop-typing', { userId: data.userId });
    }
}
