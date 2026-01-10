import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Image,
    Button,
    Input,
    FormControl,
    FormLabel,
    useToast,
    SimpleGrid,
    Badge,
    Divider,
    Icon,
} from "@chakra-ui/react";
import { FaArrowLeft, FaCheckCircle, FaUsers, FaGasPump, FaBolt } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import bikeService from "../../services/bikeService";
import api from "../../apis/axios";

const BikeDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [bike, setBike] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [referrerPhone, setReferrerPhone] = useState("");
    const [currentImageIndex] = useState(0);

    // Contact info for non-logged-in users
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");

    useEffect(() => {
        const fetchBikeDetails = async () => {
            try {
                setLoading(true);
                const data = await bikeService.getBikeById(Number(id));
                setBike(data);
            } catch (error) {
                console.error("Error fetching bike:", error);
                toast({
                    title: "Error",
                    description: "Could not load bike details",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBikeDetails();
        }

        // Auto-fill dates from URL search params if available
        const searchParams = new URLSearchParams(location.search);
        const urlStartDate = searchParams.get('startDate');
        const urlEndDate = searchParams.get('endDate');

        if (urlStartDate) {
            setStartDate(urlStartDate);
        }
        if (urlEndDate) {
            setEndDate(urlEndDate);
        }

        // Auto-fill contact info from logged-in user
        const userString = localStorage.getItem("user");
        if (userString) {
            try {
                const user = JSON.parse(userString);
                if (user.name) setContactName(user.name);
                if (user.email) setContactEmail(user.email);
                if (user.phone) setContactPhone(user.phone);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, [id, location.search]);

    const handleBookNow = async () => {
        if (!startDate || !endDate) {
            toast({
                title: "Validation Error",
                description: "Please select pick-up and drop-off dates",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            toast({
                title: "Invalid Date",
                description: "Pick-up date cannot be in the past",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (end <= start) {
            toast({
                title: "Invalid Date",
                description: "Drop-off date must be after pick-up date",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);

        // Execute reCAPTCHA v3
        if (!executeRecaptcha) {
            toast({
                title: "reCAPTCHA Error",
                description: "reCAPTCHA verification is not ready. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setIsSubmitting(false);
            return;
        }

        let recaptchaToken: string;
        try {
            recaptchaToken = await executeRecaptcha('bike_rental');
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            toast({
                title: "reCAPTCHA Error",
                description: "Failed to verify reCAPTCHA. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setIsSubmitting(false);
            return;
        }

        try {
            // Get user info if logged in
            const userString = localStorage.getItem("user");
            let userId: number | undefined = undefined;

            if (userString) {
                try {
                    const user = JSON.parse(userString);
                    userId = user.id;
                } catch (error) {
                    console.error("Error parsing user data:", error);
                }
            }

            // If not logged in, require contact info
            if (!userId) {
                if (!contactName || !contactEmail || !contactPhone || !pickupLocation) {
                    toast({
                        title: "Contact Info Required",
                        description: "Please provide your contact information and pickup location to book",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }

                // Validate email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(contactEmail)) {
                    toast({
                        title: "Invalid Email",
                        description: "Please enter a valid email address",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }
            }

            // Calculate total days and price (with discount)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const basePrice = days * bike.price;
            const discount = calculateDiscount(days);
            const totalPrice = basePrice * (1 - discount);

            // Create rental request
            const response = await api.post(
                'rentals',
                {
                    user_id: userId,
                    bike_id: bike.id,
                    start_date: startDate,
                    end_date: endDate,
                    price: totalPrice,
                    referrer_phone: referrerPhone || null,
                    contact_name: contactName || null,
                    contact_email: contactEmail || null,
                    contact_phone: contactPhone || null,
                    pickup_location: pickupLocation || null,
                    recaptcha_token: recaptchaToken,
                },
                { withCredentials: true }
            );

            const bookingData = response.data;
            console.log('=== Booking response received:', bookingData);
            console.log('=== Booking ID from response:', bookingData?.bookingId);

            toast({
                title: "Booking Successful! 🎉",
                description: `Booking ID: ${bookingData?.bookingId || 'N/A'}. Check your email for confirmation details.`,
                status: "success",
                duration: 7000,
                isClosable: true,
            });

            // Navigate to track order page
            setTimeout(() => {
                navigate("/tracking");
            }, 2000);

        } catch (error: any) {
            console.error("Booking error:", error);
            toast({
                title: "Booking Failed",
                description: error.response?.data?.message || "Something went wrong. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateDiscount = (days: number): number => {
        if (days >= 30) return 0.20; // 20% discount for 30+ days
        if (days >= 7) return 0.10; // 10% discount for 7+ days
        return 0; // No discount for less than 7 days
    };

    const getRentalDays = (): number => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const getBasePrice = (): number => {
        const days = getRentalDays();
        return days * bike.price;
    };

    const getDiscountPercentage = (): number => {
        const days = getRentalDays();
        return calculateDiscount(days) * 100;
    };

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        if (days <= 0) return 0;

        const basePrice = days * bike.price;
        const discount = calculateDiscount(days);
        const discountedPrice = basePrice * (1 - discount);

        return discountedPrice;
    };

    if (loading) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Text>Loading...</Text>
            </Box>
        );
    }

    if (!bike) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Text>Bike not found</Text>
            </Box>
        );
    }

    const bikeImages = bike.images || [bike.image];
    const days = startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const total = calculateTotal();

    return (
        <Box minH="100vh" bg="gray.50" py={8}>
            <Container maxW="container.xl">
                {/* Back Button */}
                <Button
                    leftIcon={<FaArrowLeft />}
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    mb={4}
                >
                    Back
                </Button>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                    {/* Left Side - Images and Details */}
                    <VStack spacing={6} align="stretch">
                        {/* Main Image */}
                        <Box position="relative" borderRadius="xl" overflow="hidden" bg="white" shadow="lg">
                            <Image
                                src={bikeImages[currentImageIndex]}
                                alt={bike.model}
                                w="100%"
                                h={{ base: "300px", md: "400px" }}
                                objectFit="cover"
                            />
                            {bike.status !== 'available' && (
                                <Badge
                                    position="absolute"
                                    top={4}
                                    left={4}
                                    colorScheme="red"
                                    fontSize="md"
                                    px={3}
                                    py={1}
                                >
                                    {bike.status}
                                </Badge>
                            )}
                        </Box>

                        {/* Bike Title */}
                        <Box bg="white" p={6} borderRadius="xl" shadow="md">
                            <Heading as="h1" size="xl" mb={2}>
                                {bike.model}
                            </Heading>
                            <Text color="gray.600" fontSize="sm" mb={4}>
                                {bike.Park?.name || "BikeHub"}
                            </Text>

                            {/* Type Badge */}
                            <Badge
                                colorScheme={bike.transmission === 'Manual' ? 'orange' : bike.fuel_type === 'electric' ? 'green' : 'blue'}
                                fontSize="sm"
                                mb={4}
                                textTransform="uppercase"
                            >
                                {bike.transmission === 'Manual' ? 'Manual Bike' : bike.fuel_type === 'electric' ? 'Electric Scooter' : 'Scooter'}
                            </Badge>

                            {/* Specs */}
                            <HStack spacing={6} mb={4}>
                                <HStack spacing={2}>
                                    <Icon as={FaUsers} color="gray.600" />
                                    <Text fontSize="sm">{bike.seats || 2} Seats</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Icon as={bike.fuel_type === 'electric' ? FaBolt : FaGasPump} color="gray.600" />
                                    <Text fontSize="sm" textTransform="capitalize">{bike.fuel_type || 'Gasoline'}</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Icon as={GiGearStickPattern} color="gray.600" />
                                    <Text fontSize="sm" textTransform="capitalize">{bike.transmission || 'Automatic'}</Text>
                                </HStack>
                            </HStack>

                            <Divider my={4} />

                            {/* Description */}
                            <Heading as="h3" size="md" mb={3}>
                                Description
                            </Heading>
                            <Text color="gray.700" mb={4}>
                                {bike.description || `Experience the city on this stylish and modern scooter. The ${bike.model} offers a smooth and efficient ride for urban commuting.`}
                            </Text>

                            {/* Highlights */}
                            <Heading as="h3" size="md" mb={3}>
                                Highlights
                            </Heading>
                            <SimpleGrid columns={2} spacing={4}>
                                <HStack>
                                    <Icon as={FaCheckCircle} color="green.500" />
                                    <Text fontSize="sm">
                                        {bike.rating && bike.rating >= 4.5 ? 'Excellent' : bike.rating && bike.rating >= 3.5 ? 'Good' : 'Fair'} condition
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Icon as={FaCheckCircle} color="green.500" />
                                    <Text fontSize="sm">Recently serviced</Text>
                                </HStack>
                                <HStack>
                                    <Icon as={FaCheckCircle} color="green.500" />
                                    <Text fontSize="sm">Professionally cleaned</Text>
                                </HStack>
                                {bike.fuel_type === 'electric' && (
                                    <HStack>
                                        <Icon as={FaCheckCircle} color="green.500" />
                                        <Text fontSize="sm">Eco-friendly</Text>
                                    </HStack>
                                )}
                                {bike.transmission === 'Manual' && bike.price > 400000 && (
                                    <HStack>
                                        <Icon as={FaCheckCircle} color="green.500" />
                                        <Text fontSize="sm">Off-road capable</Text>
                                    </HStack>
                                )}
                            </SimpleGrid>

                            {/* Features */}
                            <Heading as="h3" size="md" mt={6} mb={3}>
                                Features
                            </Heading>
                            <SimpleGrid columns={2} spacing={4}>
                                {/* Premium bikes (>200k) get Smart Key */}
                                {bike.price > 200000 && (
                                    <HStack>
                                        <Icon as={FaCheckCircle} color="green.500" />
                                        <Text fontSize="sm">Smart Key</Text>
                                    </HStack>
                                )}

                                {/* Modern bikes get LED Lighting */}
                                {(bike.price > 150000 || bike.fuel_type === 'electric') && (
                                    <HStack>
                                        <Icon as={FaCheckCircle} color="green.500" />
                                        <Text fontSize="sm">Full LED Lighting</Text>
                                    </HStack>
                                )}

                                {/* Mid-range and premium bikes get USB Charger */}
                                {bike.price > 120000 && (
                                    <HStack>
                                        <Icon as={FaCheckCircle} color="green.500" />
                                        <Text fontSize="sm">USB Charger</Text>
                                    </HStack>
                                )}

                                {/* Premium bikes get ABS */}
                                {bike.price > 200000 && (
                                    <HStack>
                                        <Icon as={FaCheckCircle} color="green.500" />
                                        <Text fontSize="sm">ABS</Text>
                                    </HStack>
                                )}

                                {/* Adventure bikes get additional features */}
                                {bike.transmission === 'Manual' && bike.price > 400000 && (
                                    <>
                                        <HStack>
                                            <Icon as={FaCheckCircle} color="green.500" />
                                            <Text fontSize="sm">High Ground Clearance</Text>
                                        </HStack>
                                        <HStack>
                                            <Icon as={FaCheckCircle} color="green.500" />
                                            <Text fontSize="sm">Knobby Tires</Text>
                                        </HStack>
                                    </>
                                )}

                                {/* Budget bikes get basic features */}
                                {bike.price <= 120000 && (
                                    <>
                                        <HStack>
                                            <Icon as={FaCheckCircle} color="green.500" />
                                            <Text fontSize="sm">Fuel Efficient</Text>
                                        </HStack>
                                        <HStack>
                                            <Icon as={FaCheckCircle} color="green.500" />
                                            <Text fontSize="sm">Easy to Ride</Text>
                                        </HStack>
                                    </>
                                )}

                                {/* Electric bikes */}
                                {bike.fuel_type === 'electric' && (
                                    <>
                                        <HStack>
                                            <Icon as={FaCheckCircle} color="green.500" />
                                            <Text fontSize="sm">Zero Emissions</Text>
                                        </HStack>
                                        <HStack>
                                            <Icon as={FaCheckCircle} color="green.500" />
                                            <Text fontSize="sm">Silent Operation</Text>
                                        </HStack>
                                    </>
                                )}
                            </SimpleGrid>
                        </Box>
                    </VStack>

                    {/* Right Side - Booking Form */}
                    <Box position="sticky" top={4} h="fit-content">
                        <Box bg="white" p={6} borderRadius="xl" shadow="lg">
                            <Heading as="h2" size="lg" mb={2}>
                                Book this motorcycle
                            </Heading>
                            <HStack mb={6}>
                                <Heading as="h3" size="2xl" color="teal.600">
                                    {bike.price.toLocaleString('vi-VN')} VNĐ
                                </Heading>
                                <Text color="gray.600" fontSize="lg">
                                    {bike.price?.toLocaleString()} đ/day
                                </Text>
                            </HStack>

                            <VStack spacing={4} align="stretch">
                                {/* Pick-up / Drop-off */}
                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">Pick-up / Drop-off</FormLabel>
                                    <HStack spacing={2}>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <Text>to</Text>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </HStack>
                                </FormControl>

                                {/* Contact Info - always show */}
                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">Your Name</FormLabel>
                                    <Input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">Email</FormLabel>
                                    <Input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">Phone Number</FormLabel>
                                    <Input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">Pickup Location</FormLabel>
                                    <Input
                                        type="text"
                                        placeholder="Enter pickup address (e.g., 123 Nguyen Hue Street)"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                    />
                                </FormControl>

                                {/* Referrer Phone (Optional) */}
                                <FormControl>
                                    <FormLabel fontWeight="semibold">
                                        Referrer's Phone (Optional)
                                    </FormLabel>
                                    <Input
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={referrerPhone}
                                        onChange={(e) => setReferrerPhone(e.target.value)}
                                    />
                                </FormControl>

                                <Divider />

                                {/* Pricing Summary */}
                                {getRentalDays() > 0 && (
                                    <>
                                        <HStack justify="space-between">
                                            <Text>Rental Duration</Text>
                                            <Text fontWeight="semibold">{getRentalDays()} day{getRentalDays() > 1 ? 's' : ''}</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text>Base Price</Text>
                                            <Text
                                                fontWeight="semibold"
                                                textDecoration={getDiscountPercentage() > 0 ? "line-through" : "none"}
                                                color={getDiscountPercentage() > 0 ? "gray.500" : "inherit"}
                                            >
                                                {getBasePrice().toLocaleString()} VNĐ
                                            </Text>
                                        </HStack>

                                        {getDiscountPercentage() > 0 && (
                                            <HStack justify="space-between" bg="green.50" p={2} borderRadius="md">
                                                <HStack>
                                                    <Text color="green.600" fontWeight="bold">🎉 Discount</Text>
                                                    <Text fontSize="xs" color="green.600">
                                                        ({getDiscountPercentage()}% off for {getRentalDays()}+ days)
                                                    </Text>
                                                </HStack>
                                                <Text color="green.600" fontWeight="bold">
                                                    -{(getBasePrice() - total).toLocaleString()} VNĐ
                                                </Text>
                                            </HStack>
                                        )}
                                    </>
                                )}

                                <HStack justify="space-between">
                                    <Text>Taxes & Fees</Text>
                                    <Text fontWeight="semibold">0 VNĐ</Text>
                                </HStack>
                                <Divider />
                                <HStack justify="space-between">
                                    <Heading as="h4" size="md">Total</Heading>
                                    <Heading as="h4" size="md" color="teal.600">
                                        {total.toLocaleString()} VNĐ
                                    </Heading>
                                </HStack>

                                {getRentalDays() === 0 && (
                                    <Text fontSize="xs" color="gray.500" textAlign="center">
                                        Select dates to see pricing
                                    </Text>
                                )}

                                {/* Book Now Button */}
                                <Button
                                    colorScheme="teal"
                                    size="lg"
                                    w="full"
                                    onClick={handleBookNow}
                                    isLoading={isSubmitting}
                                    loadingText="Processing..."
                                    isDisabled={!startDate || !endDate || bike.status !== 'available'}
                                >
                                    Book Now
                                </Button>

                                {bike.status !== 'available' && (
                                    <Text fontSize="sm" color="red.500" textAlign="center">
                                        This motorcycle is currently not available
                                    </Text>
                                )}
                            </VStack>
                        </Box>
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default BikeDetailsPage;
