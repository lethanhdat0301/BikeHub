import React, { useState } from "react";
import { AdminChatList } from "./AdminChatList";
import { AdminChatWindow } from "./AdminChatWindow";

interface Conversation {
    id: number;
    customer_id: number;
    dealer_or_admin_id: number;
    Customer: {
        id: number;
        name: string;
        image: string | null;
    };
    DealerOrAdmin: {
        id: number;
        name: string;
        image: string | null;
    };
    messages: Array<{
        content: string;
        created_at: string;
    }>;
    updated_at: string;
}

const AdminChatPage: React.FC = () => {
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = currentUser.id;

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
    };

    const handleCloseChat = () => {
        setSelectedConversation(null);
    };

    const getOtherUser = (conv: Conversation) => {
        if (conv.customer_id === currentUserId) {
            return conv.DealerOrAdmin;
        }
        return conv.Customer;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen p-4">
            {/* Chat List - Left side */}
            <div className="lg:col-span-1">
                <AdminChatList
                    currentUserId={currentUserId}
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                />
            </div>

            {/* Chat Window - Right side */}
            <div className="lg:col-span-2">
                {selectedConversation ? (
                    <AdminChatWindow
                        conversationId={selectedConversation.id}
                        otherUserName={getOtherUser(selectedConversation).name}
                        otherUserImage={getOtherUser(selectedConversation).image || ""}
                        currentUserId={currentUserId}
                        onClose={handleCloseChat}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-lg">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="mt-2 text-gray-400">
                                Chọn một cuộc trò chuyện để bắt đầu
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatPage;
