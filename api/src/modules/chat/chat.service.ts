import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(customerId: number, dealerOrAdminId: number) {
    return this.prisma.conversation.upsert({
      where: {
        customer_id_dealer_or_admin_id: {
          customer_id: customerId,
          dealer_or_admin_id: dealerOrAdminId,
        },
      },
      update: {},
      create: {
        customer_id: customerId,
        dealer_or_admin_id: dealerOrAdminId,
      },
      include: {
        messages: {
          orderBy: { created_at: 'asc' },
          include: {
            Sender: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
  }

  async createMessage(
    conversationId: number,
    senderId: number,
    content: string,
    attachment?: string,
  ) {
    return this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        attachment,
      },
      include: {
        Sender: { select: { id: true, name: true, image: true } },
      },
    });
  }

  async getConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ customer_id: userId }, { dealer_or_admin_id: userId }],
      },
      include: {
        Customer: { select: { id: true, name: true, image: true } },
        DealerOrAdmin: { select: { id: true, name: true, image: true } },
        messages: {
          take: 1,
          orderBy: { created_at: 'desc' },
          include: {
            Sender: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async getConversationMessages(conversationId: number, limit: number = 50) {
    return this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      include: {
        Sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async markMessagesAsRead(conversationId: number, userId: number) {
    return this.prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        is_read: false,
      },
      data: { is_read: true },
    });
  }
}
