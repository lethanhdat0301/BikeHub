import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
    Sender: {
        id: number;
        name: string;
        image: string | null;
    };
    is_read: boolean;
}

interface ChatWindowProps {
    conversationId: number;
    otherUserName: string;
    otherUserImage?: string;
    currentUserId: number;
    onClose: () => void;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3300";

export const AdminChatWindow: React.FC<ChatWindowProps> = ({
    conversationId,
    otherUserName,
    otherUserImage,
    currentUserId,
    onClose,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Fetch existing messages
        const fetchMessages = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/chat/conversations/${conversationId}/messages`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await response.json();
                setMessages(data.reverse());
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                setIsLoading(false);
            }
        };

        fetchMessages();

        // Connect to WebSocket
        const newSocket = io(`${API_URL}/chat`, {
            path: "/socket.io",
            auth: { token },
        });

        newSocket.on("connect", () => {
            newSocket.emit("join-conversation", {
                conversationId,
                userId: currentUserId,
            });
        });

        newSocket.on("new-message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        newSocket.on("user-typing", (data: { userId: number }) => {
            if (data.userId !== currentUserId) {
                setIsTyping(true);
            }
        });

        newSocket.on("user-stop-typing", () => {
            setIsTyping(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [conversationId, currentUserId]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const messageContent = inputValue;
        setInputValue("");
        setIsSending(true);

        if (socket) {
            socket.emit("send-message", {
                conversationId,
                senderId: currentUserId,
                content: messageContent,
            });
            socket.emit("stop-typing", { conversationId, userId: currentUserId });
        }

        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_URL}/api/chat/conversations/${conversationId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: messageContent,
                }),
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleTyping = () => {
        if (socket) {
            socket.emit("typing", { conversationId, userId: currentUserId });
        }
    };

    const handleStopTyping = () => {
        if (socket) {
            socket.emit("stop-typing", { conversationId, userId: currentUserId });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <img
                        src={otherUserImage || "https://via.placeholder.com/40"}
                        alt={otherUserName}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <h3 className="font-bold text-gray-900">{otherUserName}</h3>
                        {isTyping && <p className="text-xs text-gray-500">đang nhập...</p>}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                >
                    ✕
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">Chưa có tin nhắn nào</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                                } items-end gap-2`}
                        >
                            {msg.sender_id !== currentUserId && (
                                <img
                                    src={msg.Sender.image || "https://via.placeholder.com/32"}
                                    alt={msg.Sender.name}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender_id === currentUserId
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-900"
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <time className="text-xs opacity-70 block mt-1">
                                    {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </time>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex items-center gap-2 p-4 border-t border-gray-200">
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    onFocus={handleTyping}
                    onBlur={handleStopTyping}
                    disabled={isSending}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isSending || !inputValue.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                >
                    {isSending ? "..." : "Gửi"}
                </button>
            </div>
        </div>
    );
};
