import React, { useState, useEffect } from "react";

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

interface AdminChatListProps {
    currentUserId: number;
    onSelectConversation: (conversation: Conversation) => void;
    selectedConversationId?: number;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3300";

export const AdminChatList: React.FC<AdminChatListProps> = ({
    currentUserId,
    onSelectConversation,
    selectedConversationId,
}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_URL}/api/chat/conversations`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch conversations");

                const data = await response.json();
                setConversations(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching conversations:", error);
                setIsLoading(false);
            }
        };

        fetchConversations();
        // Poll for new conversations every 5 seconds
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    const getOtherUser = (conv: Conversation) => {
        if (conv.customer_id === currentUserId) {
            return conv.DealerOrAdmin;
        }
        return conv.Customer;
    };

    const filteredConversations = conversations.filter((conv) => {
        const otherUser = getOtherUser(conv);
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Tin nhắn</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center h-96 text-gray-400">
                        <p>
                            {conversations.length === 0
                                ? "Chưa có cuộc trò chuyện"
                                : "Không tìm thấy"}
                        </p>
                    </div>
                ) : (
                    filteredConversations.map((conversation) => {
                        const otherUser = getOtherUser(conversation);
                        const lastMessage = conversation.messages[0];
                        const isSelected = conversation.id === selectedConversationId;

                        return (
                            <div
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation)}
                                className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition ${isSelected ? "bg-blue-50" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={otherUser.image || "https://via.placeholder.com/40"}
                                        alt={otherUser.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-gray-900">
                                                {otherUser.name}
                                            </h4>
                                            <span className="text-xs text-gray-500">
                                                {lastMessage
                                                    ? new Date(lastMessage.created_at).toLocaleTimeString(
                                                        "vi-VN",
                                                        { hour: "2-digit", minute: "2-digit" }
                                                    )
                                                    : ""}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 truncate">
                                            {lastMessage?.content || "Không có tin nhắn"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
