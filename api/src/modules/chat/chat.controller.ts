import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { AuthUser } from '../auth/auth.user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@AuthUser() user: any) {
    return this.chatService.getConversations(user.id);
  }

  @Post('start')
  async startConversation(
    @AuthUser() user: any,
    @Body() body: { recipientId: number },
  ) {
    return this.chatService.getOrCreateConversation(user.id, body.recipientId);
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @AuthUser() user: any,
  ) {
    return this.chatService.getConversationMessages(conversationId);
  }

  @Post('conversations/:conversationId/messages')
  async sendMessage(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @AuthUser() user: any,
    @Body() body: { content: string; attachment?: string },
  ) {
    return this.chatService.createMessage(
      conversationId,
      user.id,
      body.content,
      body.attachment,
    );
  }

  @Post('conversations/:conversationId/read')
  async markAsRead(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @AuthUser() user: any,
  ) {
    return this.chatService.markMessagesAsRead(conversationId, user.id);
  }
}
