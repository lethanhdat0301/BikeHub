import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthUser } from '../auth/auth.user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  private resolveUserId(user: any, rawUserId?: string | number): number {
    if (user?.id) {
      return Number(user.id);
    }

    const parsedUserId = Number(rawUserId);
    if (!Number.isNaN(parsedUserId) && parsedUserId > 0) {
      return parsedUserId;
    }

    throw new BadRequestException('userId is required');
  }

  @Post('public/guest-session')
  async createGuestSession(
    @Body()
    body: {
      guestKey?: string;
      name?: string;
      recipientId?: number;
    },
  ) {
    return this.chatService.createGuestSession(
      body.guestKey,
      body.name,
      body.recipientId,
    );
  }

  @Get('conversations')
  async getConversations(
    @AuthUser() user: any,
    @Query('userId') userId?: string,
  ) {
    const resolvedUserId = this.resolveUserId(user, userId);
    return this.chatService.getConversations(resolvedUserId);
  }

  @Post('start')
  async startConversation(
    @AuthUser() user: any,
    @Body() body: { recipientId: number; userId?: number },
  ) {
    const resolvedUserId = this.resolveUserId(user, body.userId);
    return this.chatService.getOrCreateConversation(resolvedUserId, body.recipientId);
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    return this.chatService.getConversationMessages(conversationId);
  }

  @Post('conversations/:conversationId/messages')
  async sendMessage(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @AuthUser() user: any,
    @Body() body: { content: string; attachment?: string; senderId?: number },
  ) {
    const resolvedUserId = this.resolveUserId(user, body.senderId);
    return this.chatService.createMessage(
      conversationId,
      resolvedUserId,
      body.content,
      body.attachment,
    );
  }

  @Post('conversations/:conversationId/read')
  async markAsRead(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @AuthUser() user: any,
    @Body() body: { userId?: number },
  ) {
    const resolvedUserId = this.resolveUserId(user, body.userId);
    return this.chatService.markMessagesAsRead(conversationId, resolvedUserId);
  }
}
