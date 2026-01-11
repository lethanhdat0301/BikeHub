import React, { useEffect } from "react";
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    List,
    ListItem,
    ListIcon,
    Divider,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { CheckCircleIcon, InfoIcon } from "@chakra-ui/icons";
import { FaClock, FaCalendarAlt, FaTruck, FaHandshake } from "react-icons/fa";

const TermsPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("gray.800", "white");

    return (
        <Box bg={bgColor} minH="100vh" py={12}>
            <Container maxW="container.lg">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <Box textAlign="center" mb={8}>
                        <Heading size="2xl" color={headingColor} mb={4}>
                            Terms of Service
                        </Heading>
                        <Text fontSize="lg" color={textColor}>
                            Please read our terms and conditions carefully before using our services
                        </Text>
                    </Box>

                    {/* Exemptions Section */}
                    <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg">
                        <Heading size="lg" color="teal.600" mb={6} display="flex" alignItems="center">
                            <Icon as={InfoIcon} mr={3} />
                            Service Exemptions & Benefits
                        </Heading>

                        <VStack spacing={6} align="stretch">
                            {/* Rental Hours */}
                            <Box>
                                <HStack mb={3}>
                                    <Icon as={FaClock} color="blue.500" boxSize={5} />
                                    <Heading size="md" color={headingColor}>
                                        Rental Hours Policy
                                    </Heading>
                                </HStack>
                                <Text color={textColor} fontSize="md" lineHeight="1.6">
                                    Standard rental period is from 12:00 PM to 12:00 PM the following day.
                                    If you exceed the return time by more than 3 hours, an additional day will be charged.
                                </Text>
                            </Box>

                            <Divider />

                            {/* Weekly Discount */}
                            <Box>
                                <HStack mb={3}>
                                    <Icon as={FaCalendarAlt} color="green.500" boxSize={5} />
                                    <Heading size="md" color={headingColor}>
                                        Weekly Rental Promotion
                                    </Heading>
                                </HStack>
                                <Text color={textColor} fontSize="md" lineHeight="1.6">
                                    Rent for 7 consecutive days and enjoy special promotional rates with significant discounts
                                    on your total rental cost.
                                </Text>
                            </Box>

                            <Divider />

                            {/* Free Delivery */}
                            <Box>
                                <HStack mb={3}>
                                    <Icon as={FaTruck} color="orange.500" boxSize={5} />
                                    <Heading size="md" color={headingColor}>
                                        Free Delivery & Pickup
                                    </Heading>
                                </HStack>
                                <Text color={textColor} fontSize="md" lineHeight="1.6">
                                    Complimentary motorcycle delivery and pickup service for distances under 5km
                                    from our rental locations.
                                </Text>
                            </Box>
                        </VStack>
                    </Box>

                    {/* Terms & Conditions Section */}
                    <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg">
                        <Heading size="lg" color="red.600" mb={6} display="flex" alignItems="center">
                            <Icon as={FaHandshake} mr={3} />
                            Platform Service Agreement and Data Consent
                        </Heading>

                        <VStack spacing={6} align="stretch">
                            <Text color={textColor} fontSize="md" lineHeight="1.8" fontWeight="medium">
                                By confirming this, you acknowledge and agree that we operate solely as a connecting
                                platform between users and vehicle rental providers ("Dealers").
                            </Text>

                            <Box bg="blue.50" p={6} borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
                                <Heading size="sm" color="blue.700" mb={3}>
                                    Data Consent
                                </Heading>
                                <Text color="blue.700" fontSize="md" lineHeight="1.7">
                                    You expressly consent to the storage of your personal information, including your
                                    phone number and email address, and authorize us to transfer this data to the Dealer
                                    for the purpose of contacting you and providing rental services.
                                </Text>
                            </Box>

                            <Box bg="orange.50" p={6} borderRadius="lg" borderLeft="4px solid" borderColor="orange.400">
                                <Heading size="sm" color="orange.700" mb={3}>
                                    Liability Disclaimer
                                </Heading>
                                <Text color="orange.700" fontSize="md" lineHeight="1.7">
                                    You understand and accept that all matters related to vehicle quality, payments,
                                    compensation, complaints, and the terms of the rental contract, as well as any other
                                    legal issues, shall be handled and resolved directly between you and the Dealer.
                                    The platform shall not be held liable for any disputes arising from the rental transaction.
                                </Text>
                            </Box>

                            <Box bg="gray.100" p={6} borderRadius="lg">
                                <List spacing={3}>
                                    <ListItem display="flex" alignItems="flex-start">
                                        <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                                        <Text color={textColor} fontSize="sm">
                                            All rental agreements are between you and the designated dealer
                                        </Text>
                                    </ListItem>
                                    <ListItem display="flex" alignItems="flex-start">
                                        <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                                        <Text color={textColor} fontSize="sm">
                                            Vehicle inspection and condition verification is dealer's responsibility
                                        </Text>
                                    </ListItem>
                                    <ListItem display="flex" alignItems="flex-start">
                                        <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                                        <Text color={textColor} fontSize="sm">
                                            Payment processing and refund policies are managed by individual dealers
                                        </Text>
                                    </ListItem>
                                    <ListItem display="flex" alignItems="flex-start">
                                        <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                                        <Text color={textColor} fontSize="sm">
                                            Insurance coverage and liability terms are defined in dealer agreements
                                        </Text>
                                    </ListItem>
                                </List>
                            </Box>
                        </VStack>
                    </Box>

                    {/* Footer */}
                    <Box textAlign="center" py={6}>
                        <Text color={textColor} fontSize="sm">
                            Last updated: January 11, 2026
                        </Text>
                        <Text color={textColor} fontSize="sm" mt={2}>
                            For questions regarding these terms, please contact our support team.
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default TermsPage;