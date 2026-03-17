import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Box,
  Avatar,
  Text,
  Badge,
  Spinner,
  useToast,
  Input,
  Divider,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

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

interface ChatListProps {
  currentUserId: number;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3300";

export const ChatList: React.FC<ChatListProps> = ({
  currentUserId,
  onSelectConversation,
  selectedConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/chat/conversations?userId=${currentUserId}`
        );

        if (!response.ok) throw new Error("Failed to fetch conversations");

        const data = await response.json();
        setConversations(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách chat",
          status: "error",
          duration: 3,
        });
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [currentUserId]);

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
      <VStack w="full" h="600px" justify="center" spacing={4}>
        <Spinner size="lg" />
        <Text>Đang tải...</Text>
      </VStack>
    );
  }

  return (
    <VStack
      w="full"
      h="600px"
      borderRadius="lg"
      bg="white"
      boxShadow="lg"
      spacing={0}
      overflow="hidden"
    >
      {/* Header */}
      <Box w="full" p={4} borderBottom="1px" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          Tin nhắn
        </Text>
        <HStack position="relative">
          <SearchIcon color="gray.400" />
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện..."
            border="none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            _focus={{ outline: "none" }}
          />
        </HStack>
      </Box>

      {/* Conversations List */}
      <VStack
        w="full"
        flex={1}
        overflowY="auto"
        spacing={0}
        align="stretch"
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#cbd5e0",
            borderRadius: "4px",
          },
        }}
      >
        {filteredConversations.length === 0 ? (
          <Box w="full" textAlign="center" py={10}>
            <Text color="gray.400">
              {conversations.length === 0
                ? "Chưa có cuộc trò chuyện"
                : "Không tìm thấy"}
            </Text>
          </Box>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = conversation.messages[0];
            const isSelected = conversation.id === selectedConversationId;

            return (
              <Box
                key={conversation.id}
                w="full"
                p={3}
                cursor="pointer"
                bg={isSelected ? "blue.50" : "white"}
                _hover={{ bg: "gray.50" }}
                borderBottom="1px"
                borderColor="gray.100"
                onClick={() => onSelectConversation(conversation)}
                transition="all 0.2s"
              >
                <HStack w="full" spacing={3}>
                  <Avatar name={otherUser.name} src={otherUser.image} />
                  <VStack flex={1} align="start" spacing={0}>
                    <HStack w="full" justify="space-between">
                      <Text fontWeight="bold" fontSize="sm">
                        {otherUser.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {lastMessage
                          ? new Date(lastMessage.created_at).toLocaleTimeString(
                              "vi-VN",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : ""}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      noOfLines={1}
                      w="full"
                    >
                      {lastMessage?.content || "Không có tin nhắn"}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            );
          })
        )}
      </VStack>
    </VStack>
  );
};
