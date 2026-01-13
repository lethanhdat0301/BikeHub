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
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);

    // Mock data for orders
    const mockOrders: Order[] = [
        {
            id: 1,
            bookingId: "ORD001234",
            bikeName: "Honda SH 150i",
            bikeModel: "Scooter",
            bikeImage: bike1,
            customerName: "John Doe",
            phoneNumber: "+84 123 456 789",
            deliveryAddress: "123 Beach Road, Phu Quoc",
            orderDate: "2024-12-25 10:30 AM",
            expectedDelivery: "2024-12-26 02:00 PM",
            currentStatus: 2,
            totalPrice: 350,
            dealerInfo: {
                name: "Phu Quoc Bike Center",
                phone: "+84 297 123 4567",
                email: "phuquoc@bikehub.vn"
            },
            trackingSteps: [
                {
                    title: "Order Confirmed",
                    description: "Your order has been confirmed",
                    timestamp: "2024-12-25 10:30 AM",
                },
                {
                    title: "Preparing Motorcycle",
                    description: "We're getting your motorcycle ready",
                    timestamp: "2024-12-25 11:00 AM",
                },
                {
                    title: "Out for Delivery",
                    description: "Your motorcycle is on the way",
                    timestamp: "2024-12-26 09:00 AM",
                },
                {
                    title: "Delivered",
                    description: "Motorcycle delivered to your location",
                },
            ],
        },
        {
            id: 2,
            bookingId: "ORD001235",
            bikeName: "Yamaha Exciter 155",
            bikeModel: "Standard",
            bikeImage: bike2,
            customerName: "Jane Smith",
            phoneNumber: "+84 987 654 321",
            deliveryAddress: "456 Hotel Street, Nha Trang",
            orderDate: "2024-12-26 08:00 AM",
            expectedDelivery: "2024-12-26 04:00 PM",
            currentStatus: 1,
            totalPrice: 245,
            dealerInfo: {
                name: "Nha Trang Motor Station",
                phone: "+84 258 987 6543",
                email: "nhatrang@bikehub.vn"
            },
            trackingSteps: [
                {
                    title: "Order Confirmed",
                    description: "Your order has been confirmed",
                    timestamp: "2024-12-26 08:00 AM",
                },
                {
                    title: "Preparing Motorcycle",
                    description: "We're getting your motorcycle ready",
                    timestamp: "2024-12-26 08:30 AM",
                },
                {
                    title: "Out for Delivery",
                    description: "Your motorcycle is on the way",
                },
                {
                    title: "Delivered",
                    description: "Motorcycle delivered to your location",
                },
            ],
        },
    ];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            toast({
                title: "Search Required",
                description: "Please enter a Booking ID, phone number, or email",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSearching(true);

        try {
            // Search both booking-requests and rentals
            const [bookingResponse, rentalResponse] = await Promise.all([
                api.get(`/booking-requests/search/${encodeURIComponent(searchQuery)}`).catch(() => ({ data: [] })),
                api.get(`/rentals/search/${encodeURIComponent(searchQuery)}`).catch(() => ({ data: [] }))
            ]);

            const foundBookings = Array.isArray(bookingResponse.data) ? bookingResponse.data : [];
            const foundRentals = Array.isArray(rentalResponse.data) ? rentalResponse.data : [];

            // Combine and transform results
            const foundOrders = [
                ...foundBookings.map((booking: any) => ({
                    id: booking.id,
                    bookingId: `BK${String(booking.id).padStart(6, '0')}`,
                    bikeName: booking.Bike?.model || 'N/A',
                    bikeModel: booking.Bike?.transmission || 'N/A',
                    bikeImage: booking.Bike?.image || bike1,
                    customerName: booking.name || 'Guest',
                    phoneNumber: booking.contact_details || 'N/A',
                    deliveryAddress: booking.pickup_location || 'N/A',
                    orderDate: new Date(booking.created_at).toLocaleString(),
                    expectedDelivery: booking.start_date ? new Date(booking.start_date).toLocaleString() : 'N/A',
                    currentStatus: booking.status === 'COMPLETED' ? 3 : booking.status === 'APPROVED' ? 2 : 1,
                    totalPrice: booking.estimated_price || 0,
                    trackingSteps: [
                        {
                            title: "Order Confirmed",
                            description: "Your order has been confirmed",
                            timestamp: new Date(booking.created_at).toLocaleString(),
                        },
                        {
                            title: "Preparing Motorcycle",
                            description: "We're getting your motorcycle ready",
                            timestamp: booking.status !== 'PENDING' ? new Date(booking.created_at).toLocaleString() : undefined,
                        },
                        {
                            title: "Out for Delivery",
                            description: "Your motorcycle is on the way",
                            timestamp: booking.status === 'APPROVED' || booking.status === 'COMPLETED' ? (booking.start_date ? new Date(booking.start_date).toLocaleString() : undefined) : undefined,
                        },
                        {
                            title: "Delivered",
                            description: "Motorcycle delivered to your location",
                            timestamp: booking.status === 'COMPLETED' && booking.end_date ? new Date(booking.end_date).toLocaleString() : undefined,
                        },
                    ],
                })),
                ...foundRentals.map((rental: any) => ({
                    id: rental.id,
                    bookingId: `BK${String(rental.id).padStart(6, '0')}`,
                    bikeName: rental.Bike?.model || 'N/A',
                    bikeModel: rental.Bike?.transmission || 'N/A',
                    bikeImage: rental.Bike?.image || bike1,
                    customerName: rental.User?.name || rental.contact_name || 'Guest',
                    phoneNumber: rental.User?.phone || rental.contact_phone || 'N/A',
                    deliveryAddress: rental.pickup_location || rental.Bike?.Park?.location || 'N/A',
                    orderDate: new Date(rental.created_at).toLocaleString(),
                    expectedDelivery: new Date(rental.start_time).toLocaleString(),
                    currentStatus: rental.status === 'completed' ? 3 : rental.status === 'active' ? 2 : 1,
                    totalPrice: rental.price || 0,
                    trackingSteps: [
                        {
                            title: "Order Confirmed",
                            description: "Your order has been confirmed",
                            timestamp: new Date(rental.created_at).toLocaleString(),
                        },
                        {
                            title: "Preparing Motorcycle",
                            description: "We're getting your motorcycle ready",
                            timestamp: rental.status !== 'pending' ? new Date(rental.start_time).toLocaleString() : undefined,
                        },
                        {
                            title: "Out for Delivery",
                            description: "Your motorcycle is on the way",
                            timestamp: rental.status === 'active' || rental.status === 'completed' ? new Date(rental.start_time).toLocaleString() : undefined,
                        },
                        {
                            title: "Delivered",
                            description: "Motorcycle delivered to your location",
                            timestamp: rental.status === 'completed' && rental.end_time ? new Date(rental.end_time).toLocaleString() : undefined,
                        },
                    ],
                }))
            ];

            setOrders(foundOrders);

            if (foundOrders.length === 0) {
                toast({
                    title: "No Orders Found",
                    description: "No orders found with the provided information",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Orders Found",
                    description: `Found ${foundOrders.length} order(s)`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
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
                            Track Your Order
                        </Heading>
                        <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="2xl">
                            Enter your booking ID, phone number, or license plate to see the delivery
                            status.
                        </Text>
                    </Box>

                    {/* Search Form */}
                    <Box
                        as="form"
                        onSubmit={handleSearch}
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
                                    Track Your Delivery
                                </FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement pointerEvents="none">
                                        <SearchIcon color="teal.500" />
                                    </InputLeftElement>
                                    <Input
                                        type="text"
                                        placeholder="Booking ID, Phone Number, or License Plate"
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
                                loadingText="Searching..."
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg",
                                }}
                                transition="all 0.2s"
                            >
                                Track Order
                            </Button>
                        </VStack>
                    </Box>

                    {/* Orders List */}
                    {orders.length > 0 && (
                        <VStack spacing={6} w="full">
                            <Heading size="md" alignSelf="flex-start" color="gray.700">
                                Your Orders ({orders.length})
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
                                💡 Enter your order details above to track your motorcycle delivery in
                                real-time. You'll see updates from confirmation to delivery!
                            </Text>
                        </Box>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default TrackOrderPage;