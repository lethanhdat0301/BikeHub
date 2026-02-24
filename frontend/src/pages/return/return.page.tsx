import React, { useState, useEffect } from "react";
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
    SimpleGrid,
    Badge,
    HStack,
    Divider,
    Image,
    Card,
    CardBody,
    CardFooter,
    Flex,
    Icon,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Textarea,
} from "@chakra-ui/react";
import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { useTranslation } from 'react-i18next';
import { FaMotorcycle, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaPhone, FaUser } from "react-icons/fa";
import api from "../../apis/axios";
import bike1 from "../../assets/images/bikes/bike1.jpg";
import bike2 from "../../assets/images/bikes/bike2.webp";
import bike3 from "../../assets/images/bikes/bike3.webp";

interface Rental {
    id: number;
    bookingId: string;
    bikeName: string;
    bikeModel: string;
    bikeImage: string;
    licensePlate?: string;
    startDate: string;
    endDate: string;
    pickupLocation: string;
    status: "active" | "completed" | "overdue";
    totalPrice: number;
    daysRented: number;
    dealerName?: string;
    dealerPhone?: string;
}

const ReturnPage: React.FC = () => {
    const toast = useToast();
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [isReturning, setIsReturning] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");

    useEffect(() => {
        if (isOpen) {
            // Ẩn scrollbar khi modal mở
            const style = document.createElement('style');
            style.innerHTML = `
                [role="dialog"] {
                    overflow: hidden !important;
                }
                [role="dialog"] *::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
            `;
            document.head.appendChild(style);
            return () => document.head.removeChild(style);
        }
    }, [isOpen]);

    // Mock data for rentals
    const mockRentals: Rental[] = [
        {
            id: 1,
            bookingId: "BK001234",
            bikeName: "Honda SH 150i",
            bikeModel: "Scooter",
            bikeImage: bike1,
            startDate: "2024-12-20",
            endDate: "2024-12-27",
            pickupLocation: "Phu Quoc Airport",
            status: "active",
            totalPrice: 8750000,
            daysRented: 7,
            dealerName: "Nguyen Van A",
            dealerPhone: "0912345678",
        },
        {
            id: 2,
            bookingId: "BK001235",
            bikeName: "Yamaha Exciter 155",
            bikeModel: "Standard",
            bikeImage: bike2,
            startDate: "2024-12-22",
            endDate: "2024-12-29",
            pickupLocation: "Nha Trang Center",
            status: "active",
            totalPrice: 6125000,
            daysRented: 7,
            dealerName: "Tran Thi B",
            dealerPhone: "0987654321",
        },
        {
            id: 3,
            bookingId: "BK001236",
            bikeName: "Honda Wave Alpha",
            bikeModel: "Standard",
            bikeImage: bike3,
            startDate: "2024-12-15",
            endDate: "2024-12-22",
            pickupLocation: "Downtown",
            status: "completed",
            totalPrice: 4375000,
            daysRented: 7,
            dealerName: "Le Van C",
            dealerPhone: "0901234567",
        },
    ];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            toast({
                title: t('return.searchRequired'),
                description: t('return.enterDetails'),
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSearching(true);

        try {
            // Search only rentals (not booking requests)
            const rentalResponse = await api.get(`/rentals/search/${encodeURIComponent(searchQuery)}`).catch(() => ({ data: [] }));

            const foundRentalsData = Array.isArray(rentalResponse.data) ? rentalResponse.data : [];

            // Map rentals - only show active/pending (not completed)
            const allFoundRentals = foundRentalsData
                .filter((rental: any) => rental.status !== 'completed')
                .map((rental: any) => {
                    const startDate = new Date(rental.start_time);
                    const endDate = rental.end_time ? new Date(rental.end_time) : new Date();
                    const daysRented = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                    return {
                        id: rental.id,
                        bookingId: rental.booking_code || `BK${String(rental.booking_request_id || rental.id).padStart(6, '0')}`,
                        bikeName: rental.Bike?.model || 'N/A',
                        bikeModel: rental.Bike?.transmission || 'N/A',
                        bikeImage: rental.Bike?.image ? `https://storage.googleapis.com/bike_images/${rental.Bike.image}` : bike1,
                        licensePlate: rental.Bike?.license_plate,
                        startDate: startDate.toLocaleDateString(),
                        endDate: endDate.toLocaleDateString(),
                        pickupLocation: rental.pickup_location || rental.Bike?.Park?.location || 'N/A',
                        status: rental.status === 'active' ? 'active' as const :
                            rental.status === 'completed' ? 'completed' as const : 'active' as const,
                        totalPrice: rental.price || 0,
                        daysRented: daysRented,
                        dealerName: rental.Bike?.Dealer?.name || rental.dealer_name || 'N/A',
                        dealerPhone: rental.Bike?.Dealer?.phone || rental.dealer_contact || 'N/A',
                    };
                });

            setRentals(allFoundRentals);

            if (allFoundRentals.length === 0) {
                toast({
                    title: "No Rentals Found",
                    description: "No active rentals found with the provided information",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: t('return.error'),
                description: t('return.errorMessage'),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleReturnClick = (rental: Rental) => {
        setSelectedRental(rental);
        setRating(0);
        setReview("");
        onOpen();
    };

    const handleConfirmReturn = async () => {
        if (!selectedRental) return;

        setIsReturning(true);

        try {
            // Call API to return bike with rating and review
            await api.put(
                `rentals/rental/${selectedRental.id}/return`,
                {
                    rating: rating > 0 ? rating : undefined,
                    review: review.trim() || undefined,
                },
                { withCredentials: true }
            );

            toast({
                title: t('return.motorcycleReturnedSuccess'),
                description: `Booking ${selectedRental.bookingId} has been completed. ${rating > 0 ? 'Thank you for your rating!' : ''}`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Update rental status
            setRentals((prev) =>
                prev.map((r) =>
                    r.id === selectedRental.id ? { ...r, status: "completed" } : r
                )
            );

            onClose();
            setSelectedRental(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to process return. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsReturning(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "green";
            case "overdue":
                return "red";
            case "completed":
                return "gray";
            default:
                return "blue";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return t('return.statusActive');
            case "overdue":
                return t('return.statusOverdue');
            case "completed":
                return t('return.statusCompleted');
            default:
                return status;
        }
    };

    return (
        <Box minH="100vh" bgGradient="linear(to-br, teal.50, white)" py={{ base: 8, md: 16 }}>
            <Container maxW="container.xl">
                <VStack spacing={8}>
                    {/* Header */}
                    <Box textAlign="center">
                        <Heading as="h1" size={{ base: "xl", md: "2xl" }} color="teal.700" mb={3}>
                            {t('return.pageTitle')}
                        </Heading>
                        <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="2xl">
                            {t('return.pageDescription')}
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
                                    {t('return.searchLabel')}
                                </FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement pointerEvents="none">
                                        <SearchIcon color="teal.500" />
                                    </InputLeftElement>
                                    <Input
                                        type="text"
                                        placeholder={t('booking.returnSearchPlaceholder')}
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
                                Search
                            </Button>
                        </VStack>
                    </Box>

                    {/* Rentals List */}
                    {rentals.length > 0 && (
                        <Box w="full">
                            <Heading size="md" mb={6} color="gray.700">
                                Your Rentals ({rentals.length})
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {rentals.map((rental) => (
                                    <Card
                                        key={rental.id}
                                        overflow="hidden"
                                        variant="outline"
                                        borderColor="teal.200"
                                        _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
                                        transition="all 0.3s"
                                    >
                                        <Image
                                            src={rental.bikeImage}
                                            alt={rental.bikeName}
                                            h="200px"
                                            objectFit="cover"
                                        />
                                        <CardBody>
                                            <VStack align="stretch" spacing={3}>
                                                <Flex justify="space-between" align="center">
                                                    <Heading size="md" color="gray.700">
                                                        {rental.bikeName}
                                                    </Heading>
                                                    <Badge colorScheme={getStatusColor(rental.status)} fontSize="sm">
                                                        {getStatusText(rental.status)}
                                                    </Badge>
                                                </Flex>

                                                {rental.licensePlate && (
                                                    <HStack spacing={2}>
                                                        <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                                                            🏍️ xx-xx{rental.licensePlate.slice(-3)}
                                                        </Badge>
                                                    </HStack>
                                                )}

                                                <Text fontSize="sm" color="gray.600">
                                                    Booking ID: <strong>{rental.bookingId}</strong>
                                                </Text>

                                                <Divider />

                                                <HStack spacing={2}>
                                                    <Icon as={FaMotorcycle} color="teal.500" />
                                                    <Text fontSize="sm" color="gray.600">
                                                        {rental.bikeModel}
                                                    </Text>
                                                </HStack>


                                                {rental.dealerName && (
                                                    <HStack spacing={2}>
                                                        <Icon as={FaUser} color="teal.500" />
                                                        <Text fontSize="sm" color="gray.600">
                                                            Dealer: <strong>{rental.dealerName}</strong>
                                                        </Text>
                                                    </HStack>
                                                )}

                                                {rental.dealerPhone && (
                                                    <HStack spacing={2}>
                                                        <Icon as={FaPhone} color="teal.500" />
                                                        <Text fontSize="sm" color="gray.600">
                                                            Contact: <strong>{rental.dealerPhone}</strong>
                                                        </Text>
                                                    </HStack>
                                                )}

                                                <HStack spacing={2}>
                                                    <Icon as={FaCalendarAlt} color="teal.500" />
                                                    <Text fontSize="sm" color="gray.600">
                                                        {rental.startDate} → {rental.endDate}
                                                    </Text>
                                                </HStack>

                                                <HStack spacing={2}>
                                                    <Icon as={FaMapMarkerAlt} color="teal.500" />
                                                    <Text fontSize="sm" color="gray.600">
                                                        {rental.pickupLocation}
                                                    </Text>
                                                </HStack>

                                                <HStack spacing={2}>
                                                    <Icon as={FaDollarSign} color="teal.500" />
                                                    <Text fontSize="sm" color="gray.600">
                                                        Total: <strong>{rental.totalPrice?.toLocaleString('vi-VN')} VNĐ</strong> ({rental.daysRented}{" "}
                                                        days)
                                                    </Text>
                                                </HStack>

                                            </VStack>
                                        </CardBody>

                                        <CardFooter>
                                            <Button
                                                colorScheme="teal"
                                                w="full"
                                                isDisabled={rental.status === "completed"}
                                                onClick={() => handleReturnClick(rental)}
                                            >
                                                {rental.status === "completed" ? "Already Returned" : "Return Motorbike"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}
                </VStack>
            </Container>

            {/* Return Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
                <ModalOverlay />
                <ModalContent
                    maxH="90vh"
                    sx={{
                        overflow: 'hidden',
                        '&::-webkit-scrollbar': {
                            display: 'none !important',
                            width: '0 !important',
                        },
                        'scrollbarWidth': 'none !important',
                        'msOverflowStyle': 'none !important',
                    }}>
                    <ModalHeader>{t('return.confirmReturn')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        sx={{
                            overflow: 'auto',
                            '&::-webkit-scrollbar': {
                                display: 'none !important',
                                width: '0 !important',
                                height: '0 !important',
                            },
                            '&::-webkit-scrollbar-track': {
                                display: 'none !important',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                display: 'none !important',
                            },
                            'scrollbarWidth': 'none !important',
                            'msOverflowStyle': 'none !important',
                        }}>
                        {selectedRental && (
                            <VStack align="stretch" spacing={4}>
                                <Text>
                                    {t('return.areYouSure')}
                                </Text>
                                <Box bg="gray.50" p={4} borderRadius="md">
                                    <VStack align="stretch" spacing={2}>
                                        <Text>
                                            <strong>Booking ID:</strong> {selectedRental.bookingId}
                                        </Text>
                                        <Text>
                                            <strong>Motorbike:</strong> {selectedRental.bikeName}
                                        </Text>
                                        {selectedRental.dealerName && (
                                            <Text>
                                                <strong>Dealer:</strong> {selectedRental.dealerName}
                                            </Text>
                                        )}
                                        {selectedRental.dealerPhone && (
                                            <Text>
                                                <strong>Contact:</strong> {selectedRental.dealerPhone}
                                            </Text>
                                        )}
                                        <Text>
                                            <strong>Total Cost:</strong> {selectedRental.totalPrice?.toLocaleString('vi-VN')} VNĐ
                                        </Text>

                                    </VStack>
                                </Box>

                                {/* Rating Section */}
                                <Box>
                                    <FormLabel>{t('return.rateYourExperience')}</FormLabel>
                                    <HStack spacing={2}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Icon
                                                key={star}
                                                as={StarIcon}
                                                w={8}
                                                h={8}
                                                color={star <= rating ? "yellow.400" : "gray.300"}
                                                cursor="pointer"
                                                onClick={() => setRating(star)}
                                                _hover={{ color: "yellow.500" }}
                                            />
                                        ))}
                                    </HStack>
                                </Box>

                                {/* Review Section */}
                                <FormControl>
                                    <FormLabel>{t('return.leaveReview')}</FormLabel>
                                    <Textarea
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        placeholder={t('return.reviewPlaceholder')}
                                        rows={4}
                                    />
                                </FormControl>

                                <Text fontSize="sm" color="gray.600">
                                    {t('return.returnReminder')}
                                </Text>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleConfirmReturn}
                            isLoading={isReturning}
                            loadingText={t('booking.processing')}
                        >
                            {t('return.confirmReturn')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ReturnPage;