import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    private async getDefaultRecipientId() {
        const supportUser = await this.prisma.user.findFirst({
            where: {
                role: {
                    in: ['admin', 'dealer'],
                },
            },
            orderBy: [{ role: 'asc' }, { id: 'asc' }],
            select: {
                id: true,
            },
        });

        if (supportUser) {
            return supportUser.id;
        }

        const fallback = await this.prisma.user.findFirst({
            orderBy: { id: 'asc' },
            select: { id: true },
        });

        if (!fallback) {
            throw new Error('No user available to receive chat');
        }

        return fallback.id;
    }

    async createGuestSession(
        guestKey?: string,
        displayName?: string,
        recipientId?: number,
    ) {
        const safeGuestKey = (guestKey || randomUUID()).replace(/[^a-zA-Z0-9_-]/g, '');
        const guestEmail = `guest_${safeGuestKey}@guest.local`;
        const defaultName = `Guest ${safeGuestKey.slice(-6) || 'User'}`;

        const guest = await this.prisma.user.upsert({
            where: { email: guestEmail },
            update: {
                name: displayName || defaultName,
            },
            create: {
                email: guestEmail,
                name: displayName || defaultName,
                password: randomUUID(),
                role: 'user',
                status: 'active',
            },
            select: {
                id: true,
                name: true,
            },
        });

        const targetRecipientId = recipientId || (await this.getDefaultRecipientId());
        const conversation = await this.getOrCreateConversation(guest.id, targetRecipientId);

        return {
            userId: guest.id,
            userName: guest.name,
            guestKey: safeGuestKey,
            conversationId: conversation.id,
            recipientId: targetRecipientId,
        };
    }

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
