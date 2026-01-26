import React, { useState } from "react";
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    useToast,
    InputGroup,
    InputLeftElement,
    Card,
    CardBody,
    HStack,
    Badge,
    Divider,
    Icon,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
    Image,
    Flex,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useTranslation } from 'react-i18next';
import {
    FaCheckCircle,
    FaHourglassHalf,
    FaMotorcycle,
    FaTruck,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaBuilding,
} from "react-icons/fa";
import api from "../../apis/axios";
import bike1 from "../../assets/images/bikes/bike1.jpg";
import bike2 from "../../assets/images/bikes/bike2.webp";

interface Order {
    id: number;
    bookingId: string;
    bikeName: string;
    bikeModel: string;
    bikeImage: string;
    licensePlate?: string;
    customerName: string;
    phoneNumber: string;
    deliveryAddress: string;
    orderDate: string;
    expectedDelivery: string;
    currentStatus: number;
    totalPrice: number;
    dealerInfo?: {
        name: string;
        phone: string;
        email: string;
    };
    trackingSteps: {
        title: string;
        description: string;
        timestamp?: string;
    }[];
}

const TrackOrderPage: React.FC = () => {
    const toast = useToast();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastSearchQuery, setLastSearchQuery] = useState("");
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

    // Auto-refresh every 30 seconds when orders are displayed
    React.useEffect(() => {
        let interval: NodeJS.Timeout;

        if (autoRefresh && orders.length > 0 && lastSearchQuery) {
            interval = setInterval(() => {
                searchOrders(lastSearchQuery, true); // true for silent refresh
            }, 30000); // 30 seconds
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [autoRefresh, orders.length, lastSearchQuery]);

    const searchOrders = async (query?: string, silentRefresh = false) => {
        const queryToSearch = query || searchQuery;

        if (!queryToSearch.trim()) {
            toast({
                title: t('booking.errors.errorTitle'),
                description: t('booking.errors.requiredFieldsDescription'),
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSearching(true);

        // Store last search query for auto-refresh
        if (!silentRefresh) {
            setLastSearchQuery(queryToSearch);
        }

        try {
            // Search both booking-requests and rentals
            const [bookingResponse, rentalResponse] = await Promise.all([
                api.get(`/booking-requests/search/${encodeURIComponent(queryToSearch)}`).catch(() => ({ data: [] })),
                api.get(`/rentals/search/${encodeURIComponent(queryToSearch)}`).catch(() => ({ data: [] }))
            ]);

            const foundBookings = Array.isArray(bookingResponse.data) ? bookingResponse.data : [];
            const foundRentals = Array.isArray(rentalResponse.data) ? rentalResponse.data : [];

            // Combine and transform results
            const foundOrders = [
                ...foundBookings.map((booking: any) => ({
                    id: booking.id,
                    bookingId: booking.booking_code || `BK${String(booking.id).padStart(6, '0')}`,
                    bikeName: booking.Bike?.model || 'N/A',
                    bikeModel: booking.Bike?.transmission || 'N/A',
                    bikeImage: booking.Bike?.image ? `https://storage.googleapis.com/bike_images/${booking.Bike.image}` : bike1,
                    licensePlate: booking.Bike?.license_plate,
                    customerName: booking.name || 'Guest',
                    phoneNumber: booking.contact_details || 'N/A',
                    deliveryAddress: booking.pickup_location || 'N/A',
                    orderDate: new Date(booking.created_at).toLocaleString(),
                    expectedDelivery: booking.start_date ? new Date(booking.start_date).toLocaleString() : 'N/A',
                    currentStatus: booking.status === 'COMPLETED' ? 3 : booking.status === 'APPROVED' ? 2 : 1,
                    totalPrice: booking.estimated_price || 0,
                    dealerInfo: booking.Dealer ? {
                        name: booking.Dealer.name,
                        phone: booking.Dealer.phone || 'N/A',
                        email: booking.Dealer.email || 'N/A'
                    } : null,
                    trackingSteps: [
                        {
                            title: t('orderTracking.orderConfirmed'),
                            description: t('orderTracking.orderConfirmedDesc'),
                            timestamp: new Date(booking.created_at).toLocaleString(),
                        },
                        {
                            title: t('orderTracking.preparingMotorcycle'),
                            description: t('orderTracking.preparingMotorcycleDesc'),
                            timestamp: booking.status !== 'PENDING' ? new Date(booking.created_at).toLocaleString() : undefined,
                        },
                        {
                            title: t('orderTracking.outForDelivery'),
                            description: t('orderTracking.outForDeliveryDesc'),
                            timestamp: booking.status === 'APPROVED' || booking.status === 'COMPLETED' ? (booking.start_date ? new Date(booking.start_date).toLocaleString() : undefined) : undefined,
                        },
                        {
                            title: t('orderTracking.delivered'),
                            description: t('orderTracking.deliveredDesc'),
                            timestamp: booking.status === 'COMPLETED' && booking.end_date ? new Date(booking.end_date).toLocaleString() : undefined,
                        },
                    ],
                })),
                ...foundRentals.map((rental: any) => ({
                    id: rental.id,
                    bookingId: rental.booking_code || `BK${String(rental.id).padStart(6, '0')}`,
                    bikeName: rental.Bike?.model || 'N/A',
                    bikeModel: rental.Bike?.transmission || 'N/A',
                    bikeImage: rental.Bike?.image ? `https://storage.googleapis.com/bike_images/${rental.Bike.image}` : bike1,
                    licensePlate: rental.Bike?.license_plate,
                    customerName: rental.User?.name || rental.contact_name || 'Guest',
                    phoneNumber: rental.User?.phone || rental.contact_phone || 'N/A',
                    deliveryAddress: rental.pickup_location || rental.Bike?.Park?.location || 'N/A',
                    orderDate: new Date(rental.created_at).toLocaleString(),
                    expectedDelivery: new Date(rental.start_time).toLocaleString(),
                    currentStatus: (() => {
                        const status = rental.status?.toLowerCase();
                        if (status === 'completed') return 3;
                        if (status === 'active') return 2;
                        return 1; // pending or any other status
                    })(),
                    totalPrice: rental.price || 0,
                    dealerInfo: rental.Bike?.Dealer ? {
                        name: rental.Bike.Dealer.name,
                        phone: rental.Bike.Dealer.phone || 'N/A',
                        email: rental.Bike.Dealer.email || 'N/A'
                    } : null,
                    trackingSteps: [
                        {
                            title: t('orderTracking.orderConfirmed'),
                            description: t('orderTracking.orderConfirmedDesc'),
                            timestamp: new Date(rental.created_at).toLocaleString(),
                        },
                        {
                            title: t('orderTracking.preparingMotorcycle'),
                            description: t('orderTracking.preparingMotorcycleDesc'),
                            timestamp: rental.status !== 'pending' ? new Date(rental.start_time).toLocaleString() : undefined,
                        },
                        {
                            title: t('orderTracking.outForDelivery'),
                            description: t('orderTracking.outForDeliveryDesc'),
                            timestamp: rental.status === 'active' || rental.status === 'completed' ? new Date(rental.start_time).toLocaleString() : undefined,
                        },
                        {
                            title: t('orderTracking.delivered'),
                            description: t('orderTracking.deliveredDesc'),
                            timestamp: rental.status === 'completed' && rental.end_time ? new Date(rental.end_time).toLocaleString() : undefined,
                        },
                    ],
                }))
            ];

            setOrders(foundOrders);
            setLastRefreshTime(new Date());

            if (foundOrders.length === 0) {
                toast({
                    title: t('booking.errors.errorTitle'),
                    description: t('trackOrder.noOrdersFound'),
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // Enable auto-refresh when orders are found
                setAutoRefresh(true);

                if (!silentRefresh) {
                    toast({
                        title: "Orders Found",
                        description: `Found ${foundOrders.length} order(s). Auto-refresh enabled.`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }
        } catch (error) {
            console.error("Error searching orders:", error);
            if (!silentRefresh) {
                toast({
                    title: t('booking.errors.errorTitle'),
                    description: t('booking.errors.errorDescription'),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } finally {
            setIsSearching(false);
        }
    };

    const getStatusBadge = (currentStatus: number, totalSteps: number) => {
        if (currentStatus === totalSteps - 1) {
            return <Badge colorScheme="green">Delivered</Badge>;
        } else if (currentStatus === totalSteps - 2) {
            return <Badge colorScheme="blue">Out for Delivery</Badge>;
        } else if (currentStatus === 1) {
            return <Badge colorScheme="orange">Preparing</Badge>;
        } else {
            return <Badge colorScheme="yellow">Confirmed</Badge>;
        }
    };

    return (
        <Box minH="100vh" bgGradient="linear(to-br, teal.50, white)" py={{ base: 8, md: 16 }}>
            <Container maxW="container.xl">
                <VStack spacing={8}>
                    {/* Header */}
                    <Box textAlign="center">
                        <Heading as="h1" size={{ base: "xl", md: "2xl" }} color="teal.700" mb={3}>
                            {t('trackOrder.pageTitle')}
                        </Heading>
                        <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="2xl">
                            {t('trackOrder.pageDescription')}
                        </Text>
                    </Box>

                    {/* Search Form */}
                    <Box
                        as="form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            searchOrders();
                        }}
                        w="full"
                        maxW="600px"
                        bg="white"
                        p={{ base: 6, md: 8 }}
                        borderRadius="xl"
                        boxShadow="2xl"
                    >
                        <VStack spacing={6}>
                            <FormControl isRequired>
                                <FormLabel fontWeight="semibold" color="gray.700">
                                    {t('trackOrder.searchLabel')}
                                </FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement pointerEvents="none">
                                        <SearchIcon color="teal.500" />
                                    </InputLeftElement>
                                    <Input
                                        type="text"
                                        placeholder={t('trackOrder.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        borderColor="teal.300"
                                        _hover={{ borderColor: "teal.500" }}
                                        focusBorderColor="teal.500"
                                    />
                                </InputGroup>
                            </FormControl>

                            <Button
                                type="submit"
                                colorScheme="teal"
                                size="lg"
                                w="full"
                                leftIcon={<SearchIcon />}
                                isLoading={isSearching}
                                loadingText={t('booking.processing')}
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg",
                                }}
                                transition="all 0.2s"
                            >
                                {t('trackOrder.searchButton')}
                            </Button>
                        </VStack>
                    </Box>

                    {/* Last Updated Time - Only show when orders exist */}
                    {orders.length > 0 && lastRefreshTime && (
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            Last updated: {lastRefreshTime.toLocaleTimeString()} (Auto-refreshing every 30s)
                        </Text>
                    )}

                    {/* Orders List */}
                    {orders.length > 0 && (
                        <VStack spacing={6} w="full">
                            <Heading size="md" alignSelf="flex-start" color="gray.700">
                                {t('trackOrder.searchHeading')} ({orders.length})
                            </Heading>

                            {orders.map((order) => (
                                <Card
                                    key={order.id}
                                    w="full"
                                    overflow="hidden"
                                    variant="outline"
                                    borderColor="teal.200"
                                    boxShadow="lg"
                                >
                                    <CardBody>
                                        <VStack align="stretch" spacing={6}>
                                            {/* Order Header */}
                                            <Flex
                                                direction={{ base: "column", md: "row" }}
                                                gap={4}
                                                align={{ base: "flex-start", md: "center" }}
                                                justify="space-between"
                                            >
                                                <HStack spacing={4}>
                                                    <Image
                                                        src={order.bikeImage}
                                                        alt={order.bikeName}
                                                        boxSize="80px"
                                                        objectFit="cover"
                                                        borderRadius="md"
                                                    />
                                                    <VStack align="flex-start" spacing={1}>
                                                        <Heading size="md" color="gray.700">
                                                            {order.bikeName}
                                                        </Heading>
                                                        {order.licensePlate && (
                                                            <Badge colorScheme="purple" fontSize="sm">
                                                                🏍️ xx-xx{order.licensePlate.slice(-3)}
                                                            </Badge>
                                                        )}
                                                        <Text fontSize="sm" color="gray.600">
                                                            {order.bikeModel}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            Order ID: <strong>{order.bookingId}</strong>
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                                {getStatusBadge(order.currentStatus, order.trackingSteps.length)}
                                            </Flex>

                                            <Divider />

                                            {/* Order Details */}
                                            <HStack
                                                spacing={8}
                                                flexWrap="wrap"
                                                fontSize="sm"
                                                color="gray.600"
                                            >
                                                <VStack align="flex-start" spacing={1}>
                                                    <Text fontWeight="semibold">Customer</Text>
                                                    <Text>{order.customerName}</Text>
                                                </VStack>
                                                <VStack align="flex-start" spacing={1}>
                                                    <Text fontWeight="semibold">Phone</Text>
                                                    <Text>{order.phoneNumber}</Text>
                                                </VStack>
                                                <VStack align="flex-start" spacing={1}>
                                                    <Text fontWeight="semibold">Order Date</Text>
                                                    <Text>{order.orderDate}</Text>
                                                </VStack>
                                                <VStack align="flex-start" spacing={1}>
                                                    <Text fontWeight="semibold">Expected Delivery</Text>
                                                    <Text>{order.expectedDelivery}</Text>
                                                </VStack>
                                            </HStack>

                                            {/* Dealer Information */}
                                            {order.dealerInfo && (
                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.700" mb={3} display="flex" alignItems="center" gap={2}>
                                                        <Icon as={FaBuilding} color="teal.500" />
                                                        Dealer Information
                                                    </Text>
                                                    <HStack
                                                        spacing={6}
                                                        flexWrap="wrap"
                                                        fontSize="sm"
                                                        color="gray.600"
                                                        bg="gray.50"
                                                        p={4}
                                                        borderRadius="md"
                                                    >
                                                        <VStack align="flex-start" spacing={1}>
                                                            <Text fontWeight="semibold">Dealer Name</Text>
                                                            <Text>{order.dealerInfo.name}</Text>
                                                        </VStack>
                                                        <VStack align="flex-start" spacing={1}>
                                                            <Text fontWeight="semibold">Contact Phone</Text>
                                                            <HStack spacing={1}>
                                                                <Icon as={FaPhone} color="green.500" boxSize={3} />
                                                                <Text color="green.600" fontWeight="medium">
                                                                    {order.dealerInfo.phone}
                                                                </Text>
                                                            </HStack>
                                                        </VStack>
                                                        <VStack align="flex-start" spacing={1}>
                                                            <Text fontWeight="semibold">Email</Text>
                                                            <HStack spacing={1}>
                                                                <Icon as={FaEnvelope} color="blue.500" boxSize={3} />
                                                                <Text color="blue.600" fontWeight="medium">
                                                                    {order.dealerInfo.email}
                                                                </Text>
                                                            </HStack>
                                                        </VStack>
                                                    </HStack>
                                                    <Text fontSize="xs" color="orange.600" mt={2} fontStyle="italic">
                                                        💡 In case you don't receive our email confirmation, please contact the dealer directly using the information above.
                                                    </Text>
                                                </Box>
                                            )}

                                            <HStack spacing={2} fontSize="sm">
                                                <Icon as={FaMapMarkerAlt} color="teal.500" />
                                                <Text color="gray.600">
                                                    <strong>Delivery Address:</strong> {order.deliveryAddress}
                                                </Text>
                                            </HStack>

                                            <Divider />

                                            {/* Tracking Stepper */}
                                            <Box>
                                                <Text fontWeight="semibold" mb={4} color="gray.700">
                                                    Delivery Status
                                                </Text>
                                                <Stepper
                                                    index={order.currentStatus}
                                                    orientation="vertical"
                                                    height="300px"
                                                    gap="0"
                                                    colorScheme="teal"
                                                >
                                                    {order.trackingSteps.map((step, index) => (
                                                        <Step key={index}>
                                                            <StepIndicator>
                                                                <StepStatus
                                                                    complete={<StepIcon />}
                                                                    incomplete={<StepNumber />}
                                                                    active={<StepNumber />}
                                                                />
                                                            </StepIndicator>

                                                            <Box flexShrink="0">
                                                                <StepTitle>{step.title}</StepTitle>
                                                                <StepDescription>{step.description}</StepDescription>
                                                                {step.timestamp && (
                                                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                                                        {step.timestamp}
                                                                    </Text>
                                                                )}
                                                            </Box>

                                                            <StepSeparator />
                                                        </Step>
                                                    ))}
                                                </Stepper>
                                            </Box>

                                            <Divider />

                                            {/* Total Price */}
                                            <Flex justify="space-between" align="center">
                                                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                                                    Total Amount
                                                </Text>
                                                <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                                                    {order.totalPrice?.toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </Flex>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    )}

                    {/* Info Box */}
                    {orders.length === 0 && !isSearching && (
                        <Box bg="teal.50" p={6} borderRadius="lg" w="full" maxW="600px" textAlign="center">
                            <Icon as={FaMotorcycle} boxSize={12} color="teal.500" mb={3} />
                            <Text color="teal.700" fontSize="sm">
                                {t("trackOrder.pageInfoText")}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default TrackOrderPage;