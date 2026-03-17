import React, { useState, useEffect } from "react";
import { Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, IconButton, Badge } from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";
import { ChatWindow } from "./ChatWindow";
import { ChatList } from "./ChatList";
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

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);
    const [hasUnread, setHasUnread] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserName, setCurrentUserName] = useState("Guest");

    useEffect(() => {
        const initChatIdentity = async () => {
            const identity = await getChatIdentity();
            setCurrentUserId(identity.id);
            setCurrentUserName(identity.name);
        };

        initChatIdentity();
    }, []);

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setHasUnread(false);
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
        <>
            {/* Chat Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <IconButton
                    icon={<ChatIcon />}
                    onClick={() => setIsOpen(true)}
                    colorScheme="blue"
                    borderRadius="full"
                    size="lg"
                    boxShadow="lg"
                    _hover={{ boxShadow: "xl" }}
                    position="relative"
                >
                    {hasUnread && (
                        <Badge
                            colorScheme="red"
                            borderRadius="full"
                            position="absolute"
                            top={0}
                            right={0}
                        >
                            1
                        </Badge>
                    )}
                </IconButton>
            </div>

            {/* Chat Drawer */}
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={() => setIsOpen(false)}
                size="md"
            >
                <DrawerOverlay />
                <DrawerContent maxH="600px">
                    <DrawerCloseButton />
                    <DrawerHeader>Tin nhắn</DrawerHeader>

                    <DrawerBody p={0}>
                        {selectedConversation ? (
                            <ChatWindow
                                conversationId={selectedConversation.id}
                                otherUserName={getOtherUser(selectedConversation).name}
                                otherUserImage={getOtherUser(selectedConversation).image || ""}
                                currentUserId={currentUserId || 0}
                                currentUserName={currentUserName}
                                onClose={handleCloseChat}
                            />
                        ) : (
                            currentUserId && (
                                <ChatList
                                    currentUserId={currentUserId}
                                    onSelectConversation={handleSelectConversation}
                                />
                            )
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default ChatWidget;
