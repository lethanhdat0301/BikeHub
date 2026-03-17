import React, { useState } from "react";
import { Box, Grid, Spinner, Text } from "@chakra-ui/react";
import { ChatList } from "../../components/chat/ChatList";
import { ChatWindow } from "../../components/chat/ChatWindow";
import { getChatIdentity } from "../../utils/chatSession";

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

const ChatPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("Guest");

  React.useEffect(() => {
    const initChatIdentity = async () => {
      const identity = await getChatIdentity();
      setCurrentUserId(identity.id);
      setCurrentUserName(identity.name);
    };

    initChatIdentity();
  }, []);

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

  if (!currentUserId) {
    return (
      <Box w="full" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box w="full" minH="100vh" bg="gray.50" py={10} px={4}>
      <Box maxW="7xl" mx="auto">
        <Text fontSize="3xl" fontWeight="bold" mb={8} color="gray.800">
          Tin nhắn
        </Text>

        <Grid
          templateColumns={{ base: "1fr", lg: "350px 1fr" }}
          gap={6}
          h="600px"
        >
          {/* Chat List */}
          <Box>
            <ChatList
              currentUserId={currentUserId}
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </Box>

          {/* Chat Window */}
          <Box>
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                otherUserName={getOtherUser(selectedConversation).name}
                otherUserImage={getOtherUser(selectedConversation).image || ""}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onClose={handleCloseChat}
              />
            ) : (
              <Box
                borderRadius="lg"
                bg="white"
                boxShadow="lg"
                h="600px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
              >
                <Text fontSize="lg" color="gray.400">
                  Chọn một cuộc trò chuyện để bắt đầu
                </Text>
              </Box>
            )}
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

export default ChatPage;
