import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Avatar,
  Text,
  Divider,
  Spinner,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { MdClose, MdSend } from "react-icons/md";
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
  currentUserName: string;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3300";

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  otherUserName,
  otherUserImage,
  currentUserId,
  currentUserName,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/chat/conversations/${conversationId}/messages`
        );
        const data = await response.json();
        setMessages(data.reverse());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          status: "error",
          duration: 3,
        });
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Connect to WebSocket
    const newSocket = io(`${API_URL}/chat`, {
      path: "/socket.io",
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

    try {
      if (socket?.connected) {
        socket.emit("send-message", {
          conversationId,
          senderId: currentUserId,
          content: messageContent,
        });
        socket.emit("stop-typing", { conversationId, userId: currentUserId });
      } else {
        await fetch(`${API_URL}/api/chat/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: messageContent,
            senderId: currentUserId,
          }),
        });
      }
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
      <Box
        borderRadius="lg"
        bg="white"
        boxShadow="lg"
        h="600px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    );
  }

  return (
    <VStack
      spacing={0}
      borderRadius="lg"
      bg="white"
      boxShadow="lg"
      h="600px"
      overflow="hidden"
    >
      {/* Header */}
      <HStack
        w="full"
        p={4}
        borderBottom="1px"
        borderColor="gray.200"
        justifyContent="space-between"
      >
        <HStack spacing={3}>
          <Avatar name={otherUserName} src={otherUserImage} size="md" />
          <VStack spacing={0} align="start">
            <Text fontWeight="bold" fontSize="lg">
              {otherUserName}
            </Text>
            {isTyping && (
              <Text fontSize="sm" color="gray.500">
                đang nhập...
              </Text>
            )}
          </VStack>
        </HStack>
        <IconButton
          icon={<MdClose />}
          aria-label="Close chat"
          variant="ghost"
          onClick={onClose}
        />
      </HStack>

      {/* Messages Area */}
      <VStack
        flex={1}
        w="full"
        p={4}
        overflowY="auto"
        align="start"
        spacing={3}
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
          },
        }}
      >
        {messages.length === 0 ? (
          <Box w="full" textAlign="center" py={10}>
            <Text color="gray.400">Chưa có tin nhắn nào</Text>
          </Box>
        ) : (
          messages.map((msg) => (
            <HStack
              key={msg.id}
              w="full"
              justify={msg.sender_id === currentUserId ? "flex-end" : "flex-start"}
              align="flex-end"
              spacing={2}
            >
              {msg.sender_id !== currentUserId && (
                <Avatar name={msg.Sender.name} src={msg.Sender.image} size="sm" />
              )}
              <Box
                maxW="70%"
                bg={msg.sender_id === currentUserId ? "blue.500" : "gray.100"}
                color={msg.sender_id === currentUserId ? "white" : "black"}
                px={4}
                py={2}
                borderRadius="lg"
                wordBreak="break-word"
              >
                <Text fontSize="sm">{msg.content}</Text>
                <Text fontSize="xs" opacity={0.7} mt={1}>
                  {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Box>
            </HStack>
          ))
        )}
        <div ref={messagesEndRef} />
      </VStack>

      {/* Input Area */}
      <HStack
        w="full"
        p={4}
        borderTop="1px"
        borderColor="gray.200"
        spacing={2}
      >
        <Input
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
          borderRadius="lg"
        />
        <Button
          isLoading={isSending}
          onClick={handleSendMessage}
          colorScheme="blue"
          borderRadius="full"
          size="lg"
          minW="40px"
          p={0}
        >
          <MdSend />
        </Button>
      </HStack>
    </VStack>
  );
};
