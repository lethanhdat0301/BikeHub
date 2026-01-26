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
    Alert,
    AlertIcon,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
} from "@chakra-ui/react";
import { FaArrowLeft, FaCheckCircle, FaUsers, FaGasPump, FaBolt } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useTranslation } from 'react-i18next';
import bikeService from "../../services/bikeService";
import api from "../../apis/axios";
import { calculateRentalPeriod, calculateRentalPrice, calculateDiscount } from "../../utils/rentalCalculations";
import bikeImage from "../../assets/images/bike-placeholder.jpg";

const BikeDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { t } = useTranslation();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

    const [bike, setBike] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("18:00");
    const [referrerPhone, setReferrerPhone] = useState("");
    const [currentImageIndex] = useState(0);

    // Contact info for non-logged-in users
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");

    // Save form data to sessionStorage (cleared when tab closes)
    const saveFormData = () => {
        const formData = {
            startDate,
            endDate,
            startTime,
            endTime,
            contactName,
            contactEmail,
            contactPhone,
            pickupLocation,
            referrerPhone,
        };
        sessionStorage.setItem('bikeDetailsFormData', JSON.stringify(formData));
    };

    // Restore form data from sessionStorage on mount (if user refreshed during typing)
    useEffect(() => {
        const savedData = sessionStorage.getItem('bikeDetailsFormData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setStartDate(parsed.startDate || "");
                setEndDate(parsed.endDate || "");
                setStartTime(parsed.startTime || "09:00");
                setEndTime(parsed.endTime || "18:00");
                setContactName(parsed.contactName || "");
                setContactEmail(parsed.contactEmail || "");
                setContactPhone(parsed.contactPhone || "");
                setPickupLocation(parsed.pickupLocation || "");
                setReferrerPhone(parsed.referrerPhone || "");
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }
    }, []);

    // Fetch bike details and optionally restore dates from URL
    useEffect(() => {
        const fetchBikeDetails = async () => {
            try {
                setLoading(true);
                const data = await bikeService.getBikeById(Number(id));
                setBike(data);
            } catch (error) {
                console.error("Error fetching motorbike:", error);
                toast({
                    title: t('booking.errors.errorTitle'),
                    description: t('bike.couldNotLoad'),
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

        // Only restore dates from URL if sessionStorage is empty (first visit)
        const savedData = sessionStorage.getItem('bikeDetailsFormData');
        if (!savedData) {
            const searchParams = new URLSearchParams(location.search);
            const urlStartDate = searchParams.get('startDate');
            const urlEndDate = searchParams.get('endDate');

            if (urlStartDate) {
                setStartDate(urlStartDate);
            }
            if (urlEndDate) {
                setEndDate(urlEndDate);
            }
        }
    }, [id, location.search]);

    // Save form data whenever it changes
    useEffect(() => {
        if (startDate || endDate || contactName || contactEmail || contactPhone || pickupLocation || referrerPhone) {
            saveFormData();
        }
    }, [startDate, endDate, startTime, endTime, contactName, contactEmail, contactPhone, pickupLocation, referrerPhone]);

    const handleBookNow = async () => {
        if (!startDate || !endDate) {
            toast({
                title: t('bike.validationErrors.validationError'),
                description: t('bike.validationErrors.selectDates'),
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
                title: t('bike.validationErrors.invalidDate'),
                description: t('bike.validationErrors.pickupPast'),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Additional validation for same day bookings
        if (startDate === endDate) {
            if (!startTime || !endTime) {
                toast({
                    title: "Time Required",
                    description: "Please select start and end times for same-day rental",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);

            if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
                toast({
                    title: t('bike.validationErrors.invalidTime'),
                    description: t('bike.validationErrors.endTimeAfterStart'),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // Check if same day booking is for today and time is in the past
            if (startDate === today.toISOString().split('T')[0]) {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();

                if (startHour < currentHour || (startHour === currentHour && startMinute <= currentMinute)) {
                    toast({
                        title: t('bike.validationErrors.invalidTime'),
                        description: t('bike.validationErrors.startTimeCannotBePast'),
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    return;
                }
            }
        } else {
            // For multi-day bookings, validate dates only
            if (end < start) {
                toast({
                    title: t('bike.validationErrors.invalidDate'),
                    description: t('bike.validationErrors.dropoffAfterPickup'),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }
        }

        setIsSubmitting(true);

        // Execute reCAPTCHA v3
        // if (!executeRecaptcha) {
        //     toast({
        //         title: "reCAPTCHA Error",
        //         description: "reCAPTCHA verification is not ready. Please try again.",
        //         status: "error",
        //         duration: 3000,
        //         isClosable: true,
        //     });
        //     setIsSubmitting(false);
        //     return;
        // }

        let recaptchaToken: string | undefined = undefined;
        // try {
        //     recaptchaToken = await executeRecaptcha('bike_rental');
        // } catch (error) {
        //     console.error('reCAPTCHA error:', error);
        //     toast({
        //         title: "reCAPTCHA Error",
        //         description: "Failed to verify reCAPTCHA. Please try again.",
        //         status: "error",
        //         duration: 3000,
        //         isClosable: true,
        //     });
        //     setIsSubmitting(false);
        //     return;
        // }

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
                        title: t('booking.errors.requiredFieldsTitle'),
                        description: t('booking.errors.contactInfoRequired'),
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
                        title: t('booking.errors.invalidEmailTitle'),
                        description: t('booking.errors.invalidEmailDescription'),
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }
            }

            // Calculate rental period and validate
            const period = calculateRentalPeriod(startDate, endDate, startTime, endTime);

            if (period.days === 0 && period.hours === 0) {
                toast({
                    title: t('booking.errors.invalidRentalPeriodTitle'),
                    description: period.displayText,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                setIsSubmitting(false);
                return;
            }

            // Calculate total price
            const totalPrice = getRentalPrice();

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

            // Toast duration and navigate delay - longer on mobile
            const isMobile = window.innerWidth <= 768;
            // const toastDuration = isMobile ? 10000 : 7000; // 10s on mobile, 7s on desktop
            const toastDuration = null;
            const navigateDelay = isMobile ? 4000 : 2000;  // 4s on mobile, 2s on desktop

            const dealerPhoneFormatted = bookingData?.dealerPhone ? ` (Phone: ${bookingData.dealerPhone})` : '';
            const dealerInfo = bookingData?.dealerName ? t('booking.assignedToDealer', { dealerName: bookingData.dealerName, dealerPhone: dealerPhoneFormatted }) : '';

            // Clear sessionStorage on successful booking
            sessionStorage.removeItem('bikeDetailsFormData');

            toast({
                title: t('booking.rentalSuccessTitle'),
                description: t('booking.rentalSuccessDescription', { bookingId: bookingData?.bookingId || 'N/A', dealerInfo }),
                status: "success",
                duration: toastDuration,
                isClosable: true,
            });

            // Show redirect notification after a delay
            setTimeout(() => {
                toast({
                    title: t('booking.redirectingTitle'),
                    description: t('booking.redirectingDescription'),
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                });
            }, navigateDelay - 1000);

            // Navigate to track order page - delayed longer on mobile
            setTimeout(() => {
                navigate("/tracking");
            }, navigateDelay);

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

    const getRentalPeriod = () => {
        return calculateRentalPeriod(startDate, endDate, startTime, endTime);
    };

    const getRentalDays = (): number => {
        const period = getRentalPeriod();
        return period.days;
    };

    const getRentalPrice = () => {
        if (!bike) return 0;
        const period = getRentalPeriod();
        const basePrice = calculateRentalPrice(period, bike.price);

        // Apply discount for multi-day rentals
        if (period.days > 0 && !period.isHourlyRental) {
            const discount = calculateDiscount(period.days);
            return basePrice * (1 - discount);
        }

        return basePrice;
    };

    const getBasePrice = (): number => {
        if (!bike) return 0;
        const period = getRentalPeriod();
        return calculateRentalPrice(period, bike.price);
    };

    const getDiscountPercentage = (): number => {
        const period = getRentalPeriod();
        return calculateDiscount(period.days) * 100;
    };

    const calculateTotal = () => {
        return getRentalPrice();
    };

    if (loading) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Text>{t('bike.loading')}</Text>
            </Box>
        );
    }

    if (!bike) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Text>{t('bike.notFound')}</Text>
            </Box>
        );
    }

    const bikeImageUrl = bike.image ? `https://storage.googleapis.com/bike_images/${bike.image}` : bikeImage;

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
                    {t('common.back')}
                </Button>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                    {/* Left Side - Images and Details */}
                    <VStack spacing={6} align="stretch">
                        {/* Main Image */}
                        <Box position="relative" borderRadius="xl" overflow="hidden" bg="white" shadow="lg">
                            <Image
                                src={bikeImageUrl}
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
                                {bike.Park?.name || "RentnRide"}
                            </Text>

                            {/* Type Badge */}
                            <Badge
                                colorScheme={bike.transmission === 'Manual' ? 'orange' : bike.fuel_type === 'electric' ? 'green' : 'blue'}
                                fontSize="sm"
                                mb={4}
                                textTransform="uppercase"
                            >
                                {bike.transmission === 'Manual' ? t('search.filter.type.manualBike') : bike.fuel_type === 'electric' ? t('search.filter.type.electricScooter') : t('search.filter.type.scooter')}
                            </Badge>

                            {/* Specs */}
                            <HStack spacing={6} mb={4}>
                                <HStack spacing={2}>
                                    <Icon as={FaUsers} color="gray.600" />
                                    <Text fontSize="sm">{bike.seats || 2} {t('bike.seats')}</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Icon as={bike.fuel_type === 'electric' ? FaBolt : FaGasPump} color="gray.600" />
                                    <Text fontSize="sm" textTransform="capitalize">
                                        {bike.fuel_type === 'electric' ? t('bike.fuelType.electric') : t('bike.fuelType.gasoline')}
                                    </Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Icon as={GiGearStickPattern} color="gray.600" />
                                    <Text fontSize="sm" textTransform="capitalize">{bike.transmission || 'Automatic'}</Text>
                                </HStack>
                            </HStack>

                            {/* License Plate */}
                            {bike.license_plate && (
                                <Box mb={4}>
                                    <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="md">
                                        🏍️ xx-xx{bike.license_plate.slice(-3)}
                                    </Badge>
                                </Box>
                            )}

                            <Divider my={4} />

                            {/* Accordion for Description, Highlights, Features */}
                            <Accordion allowMultiple defaultIndex={[0]}>
                                {/* Description */}
                                <AccordionItem border="none">
                                    <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                                        <Heading as="h3" size="md" flex="1" textAlign="left">
                                            {t('bike.descriptionTitle')}
                                        </Heading>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel px={0} pb={4}>
                                        <Text color="gray.700">
                                            {bike.description || t('bike.descriptionDefault', { model: bike.model })}
                                        </Text>
                                    </AccordionPanel>
                                </AccordionItem>

                                {/* Highlights */}
                                <AccordionItem border="none">
                                    <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                                        <Heading as="h3" size="md" flex="1" textAlign="left">
                                            {t('bike.highlightsTitle')}
                                        </Heading>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel px={0} pb={4}>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <HStack>
                                                <Icon as={FaCheckCircle} color="green.500" />
                                                <Text fontSize="sm">
                                                    {bike.rating && bike.rating >= 4.5 ? t('bike.rating.excellent') : bike.rating && bike.rating >= 3.5 ? t('bike.rating.good') : t('bike.rating.fair')} {t('bike.rating.condition')}
                                                </Text>
                                            </HStack>
                                            <HStack>
                                                <Icon as={FaCheckCircle} color="green.500" />
                                                <Text fontSize="sm">{t('bike.highlight.recentlyServiced')}</Text>
                                            </HStack>
                                            <HStack>
                                                <Icon as={FaCheckCircle} color="green.500" />
                                                <Text fontSize="sm">{t('bike.highlight.professionallyCleaned')}</Text>
                                            </HStack>
                                            {bike.fuel_type === 'electric' && (
                                                <HStack>
                                                    <Icon as={FaCheckCircle} color="green.500" />
                                                    <Text fontSize="sm">{t('bike.highlight.ecoFriendly')}</Text>
                                                </HStack>
                                            )}
                                            {bike.transmission === 'Manual' && bike.price > 400000 && (
                                                <HStack>
                                                    <Icon as={FaCheckCircle} color="green.500" />
                                                    <Text fontSize="sm">{t('bike.highlight.offroadCapable')}</Text>
                                                </HStack>
                                            )}
                                        </SimpleGrid>
                                    </AccordionPanel>
                                </AccordionItem>

                                {/* Features */}
                                <AccordionItem border="none">
                                    <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                                        <Heading as="h3" size="md" flex="1" textAlign="left">
                                            {t('bike.featuresTitle')}
                                        </Heading>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel px={0} pb={4}>
                                        <SimpleGrid columns={2} spacing={4}>
                                            {/* Premium bikes (>200k) get Smart Key */}
                                            {bike.price > 200000 && (
                                                <HStack>
                                                    <Icon as={FaCheckCircle} color="green.500" />
                                                    <Text fontSize="sm">{t('bike.feature.smartKey')}</Text>
                                                </HStack>
                                            )}

                                            {/* Modern bikes get LED Lighting */}
                                            {(bike.price > 150000 || bike.fuel_type === 'electric') && (
                                                <HStack>
                                                    <Icon as={FaCheckCircle} color="green.500" />
                                                    <Text fontSize="sm">{t('bike.feature.fullLed')}</Text>
                                                </HStack>
                                            )}

                                            {/* Mid-range and premium bikes get USB Charger */}
                                            {bike.price > 120000 && (
                                                <HStack>
                                                    <Icon as={FaCheckCircle} color="green.500" />
                                                    <Text fontSize="sm">{t('bike.feature.usbCharger')}</Text>
                                                </HStack>
                                            )}

                                            {/* Premium bikes get ABS */}
                                            {bike.price > 200000 && (
                                                <HStack>
                                                    <Icon as={FaCheckCircle} color="green.500" />
                                                    <Text fontSize="sm">{t('bike.feature.abs')}</Text>
                                                </HStack>
                                            )}

                                            {/* Adventure bikes get additional features */}
                                            {bike.transmission === 'Manual' && bike.price > 400000 && (
                                                <>
                                                    <HStack>
                                                        <Icon as={FaCheckCircle} color="green.500" />
                                                        <Text fontSize="sm">{t('bike.feature.highGround')}</Text>
                                                    </HStack>
                                                    <HStack>
                                                        <Icon as={FaCheckCircle} color="green.500" />
                                                        <Text fontSize="sm">{t('bike.feature.knobbyTires')}</Text>
                                                    </HStack>
                                                </>
                                            )}

                                            {/* Budget bikes get basic features */}
                                            {bike.price <= 120000 && (
                                                <>
                                                    <HStack>
                                                        <Icon as={FaCheckCircle} color="green.500" />
                                                        <Text fontSize="sm">{t('bike.feature.fuelEfficient')}</Text>
                                                    </HStack>
                                                    <HStack>
                                                        <Icon as={FaCheckCircle} color="green.500" />
                                                        <Text fontSize="sm">{t('bike.feature.easyToRide')}</Text>
                                                    </HStack>
                                                </>
                                            )}

                                            {/* Electric bikes */}
                                            {bike.fuel_type === 'electric' && (
                                                <>
                                                    <HStack>
                                                        <Icon as={FaCheckCircle} color="green.500" />
                                                        <Text fontSize="sm">{t('bike.feature.zeroEmissions')}</Text>
                                                    </HStack>
                                                    <HStack>
                                                        <Icon as={FaCheckCircle} color="green.500" />
                                                        <Text fontSize="sm">{t('bike.feature.silentOperation')}</Text>
                                                    </HStack>
                                                </>
                                            )}
                                        </SimpleGrid>
                                    </AccordionPanel>
                                </AccordionItem>
                            </Accordion>
                        </Box>
                    </VStack>

                    {/* Right Side - Booking Form (Hidden on mobile, shown in drawer) */}
                    <Box position="sticky" top={4} h="fit-content" display={{ base: "none", lg: "block" }}>
                        <Box bg="white" p={6} borderRadius="xl" shadow="lg">
                            <Heading as="h2" size="lg" mb={2}>
                                {t('bike.bookThis')}
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
                                    <FormLabel fontWeight="semibold">{t('booking.pickupDropoff')}</FormLabel>
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

                                {/* Time picker for same day rentals */}
                                {startDate && endDate && startDate === endDate && (
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="semibold">{t('booking.timeRangeLabel')}</FormLabel>
                                        <HStack spacing={2}>
                                            <Input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                            />
                                            <Text>to</Text>
                                            <Input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                            />
                                        </HStack>
                                        <Alert status="info" mt={2}>
                                            <AlertIcon />
                                            <Text fontSize="sm">
                                                {(() => {
                                                    const period = getRentalPeriod();
                                                    if (period.hours > 3) {
                                                        return `${period.hours} hours rental will be charged as 1 full day (${bike.price.toLocaleString('vi-VN')} VNĐ)`;
                                                    }
                                                    const hourlyRate = Math.ceil(bike.price / 8);
                                                    return `${period.hours} hours rental: ${hourlyRate.toLocaleString('vi-VN')} VNĐ/hour`;
                                                })()}
                                            </Text>
                                        </Alert>
                                    </FormControl>
                                )}

                                {/* Rental period display */}
                                {startDate && endDate && (
                                    <Box p={3} bg="gray.50" borderRadius="md">
                                        <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                                            {t('booking.rentalPeriodLabel')}: {getRentalPeriod().displayText}
                                        </Text>
                                        {getRentalPeriod().days > 0 && getDiscountPercentage() > 0 && (
                                            <Text fontSize="sm" color="green.600">
                                                {getDiscountPercentage()}% discount applied for long-term rental
                                            </Text>
                                        )}
                                    </Box>
                                )}

                                {/* Contact Info - always show */}
                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.form.nameLabel')}</FormLabel>
                                    <Input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.form.emailLabel')}</FormLabel>
                                    <Input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.form.phoneLabel')}</FormLabel>
                                    <Input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.form.pickupLabel')}</FormLabel>
                                    <Input
                                        type="text"
                                        placeholder={t('booking.form.pickupPlaceholder')}
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
                                        placeholder={t('booking.contact.placeholder.phone')}
                                        value={referrerPhone}
                                        onChange={(e) => setReferrerPhone(e.target.value)}
                                    />
                                </FormControl>

                                <Divider />

                                {/* Pricing Summary */}
                                {(getRentalDays() > 0 || getRentalPeriod().hours > 0) && (
                                    <>
                                        <HStack justify="space-between">
                                            <Text>Rental Duration</Text>
                                            <Text fontWeight="semibold">{getRentalPeriod().displayText}</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text>Base Price</Text>
                                            <Text
                                                fontWeight="semibold"
                                                // textDecoration={getDiscountPercentage() > 0 ? "line-through" : "none"}
                                                color={getDiscountPercentage() > 0 ? "gray.500" : "inherit"}
                                            >
                                                {getBasePrice().toLocaleString('vi-VN')} VNĐ
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
                                                    -{(getBasePrice() - calculateTotal()).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </HStack>
                                        )}
                                    </>
                                )}

                                <HStack justify="space-between">
                                    <Text>{t('booking.taxesFees')}</Text>
                                    <Text fontWeight="semibold">0 VNĐ</Text>
                                </HStack>
                                <Divider />
                                <HStack justify="space-between">
                                    <Heading as="h4" size="md">{t('booking.total')}</Heading>
                                    <Heading as="h4" size="md" color="teal.600">
                                        {calculateTotal().toLocaleString('vi-VN')} VNĐ
                                    </Heading>
                                </HStack>

                                {getRentalDays() === 0 && getRentalPeriod().hours === 0 && (
                                    <Text fontSize="xs" color="gray.500" textAlign="center">
                                        {t('bike.selectDatesToSeePricing')}
                                    </Text>
                                )}

                                {/* Book Now Button */}
                                <Button
                                    colorScheme="teal"
                                    size="lg"
                                    w="full"
                                    onClick={handleBookNow}
                                    isLoading={isSubmitting}
                                    loadingText={t('booking.processing')}
                                    isDisabled={!startDate || !endDate || bike.status !== 'available'}
                                >
                                    {t('bike.bookNow')}
                                </Button>

                                {bike.status !== 'available' && (
                                    <Text fontSize="sm" color="red.500" textAlign="center">
                                        {t('bike.notAvailable')}
                                    </Text>
                                )}
                            </VStack>
                        </Box>
                    </Box>
                </SimpleGrid>

                {/* Sticky Bottom Bar - Mobile Only */}
                <Box
                    position="fixed"
                    bottom={0}
                    left={0}
                    right={0}
                    bg="white"
                    borderTop="1px"
                    borderColor="gray.200"
                    p={4}
                    display={{ base: "flex", lg: "none" }}
                    justifyContent="space-between"
                    alignItems="center"
                    zIndex={10}
                    shadow="lg"
                >
                    <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight="semibold" color="gray.600">
                            {bike.model}
                        </Text>
                        <HStack spacing={1}>
                            <Heading as="h3" size="md" color="teal.600">
                                {bike.price.toLocaleString('vi-VN')}
                            </Heading>
                            <Text fontSize="sm" color="gray.600">VNĐ/day</Text>
                        </HStack>
                        {startDate && endDate && getRentalPeriod().days > 0 && (
                            <Text fontSize="xs" color="green.600">
                                Total: {calculateTotal().toLocaleString('vi-VN')} VNĐ
                            </Text>
                        )}
                    </VStack>
                    <Button
                        colorScheme="teal"
                        size="lg"
                        onClick={onDrawerOpen}
                        isDisabled={bike.status !== 'available'}
                    >
                        {t('bike.bookNow')}
                    </Button>
                </Box>

                {/* Booking Drawer - Mobile Only */}
                <Drawer
                    isOpen={isDrawerOpen}
                    placement="bottom"
                    onClose={onDrawerClose}
                    size="full"
                >
                    <DrawerOverlay />
                    <DrawerContent borderTopRadius="xl" maxH="90vh">
                        <DrawerCloseButton />
                        <DrawerHeader borderBottomWidth="1px">
                            <VStack align="start" spacing={1}>
                                <Heading as="h2" size="md">
                                    {t('bike.bookThis')}
                                </Heading>
                                <HStack>
                                    <Heading as="h3" size="lg" color="teal.600">
                                        {bike.price.toLocaleString('vi-VN')} VNĐ
                                    </Heading>
                                    <Text color="gray.600" fontSize="sm">/day</Text>
                                </HStack>
                            </VStack>
                        </DrawerHeader>

                        <DrawerBody overflowY="auto">
                            <VStack spacing={4} align="stretch" pb={6}>
                                {/* Pick-up / Drop-off */}
                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.pickupDropoff')}</FormLabel>
                                    <VStack spacing={2}>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <Text fontSize="sm" color="gray.600">to</Text>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </VStack>
                                </FormControl>

                                {/* Time picker for same day rentals */}
                                {startDate && endDate && startDate === endDate && (
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="semibold">{t('booking.timeRangeLabel')}</FormLabel>
                                        <VStack spacing={2}>
                                            <Input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                            />
                                            <Text fontSize="sm">to</Text>
                                            <Input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                            />
                                        </VStack>
                                        <Alert status="info" mt={2}>
                                            <AlertIcon />
                                            <Text fontSize="sm">
                                                {(() => {
                                                    const period = getRentalPeriod();
                                                    if (period.hours > 3) {
                                                        return `${period.hours} hours rental will be charged as 1 full day (${bike.price.toLocaleString('vi-VN')} VNĐ)`;
                                                    }
                                                    const hourlyRate = Math.ceil(bike.price / 8);
                                                    return `${period.hours} hours rental: ${hourlyRate.toLocaleString('vi-VN')} VNĐ/hour`;
                                                })()}
                                            </Text>
                                        </Alert>
                                    </FormControl>
                                )}

                                {/* Rental period display */}
                                {startDate && endDate && (
                                    <Box p={3} bg="gray.50" borderRadius="md">
                                        <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                                            {t('booking.rentalPeriodLabel')}: {getRentalPeriod().displayText}
                                        </Text>
                                        {getRentalPeriod().days > 0 && getDiscountPercentage() > 0 && (
                                            <Text fontSize="sm" color="green.600">
                                                {getDiscountPercentage()}% discount applied for long-term rental
                                            </Text>
                                        )}
                                    </Box>
                                )}

                                {/* Contact Info */}
                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.form.nameLabel')}</FormLabel>
                                    <Input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.form.emailLabel')}</FormLabel>
                                    <Input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.form.phoneLabel')}</FormLabel>
                                    <Input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold">{t('booking.form.pickupLabel')}</FormLabel>
                                    <Input
                                        type="text"
                                        placeholder={t('booking.form.pickupPlaceholder')}
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
                                        placeholder={t('booking.contact.placeholder.phone')}
                                        value={referrerPhone}
                                        onChange={(e) => setReferrerPhone(e.target.value)}
                                    />
                                </FormControl>

                                <Divider />

                                {/* Pricing Summary */}
                                {(getRentalDays() > 0 || getRentalPeriod().hours > 0) && (
                                    <>
                                        <HStack justify="space-between">
                                            <Text>Rental Duration</Text>
                                            <Text fontWeight="semibold">{getRentalPeriod().displayText}</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text>Base Price</Text>
                                            <Text
                                                fontWeight="semibold"
                                                color={getDiscountPercentage() > 0 ? "gray.500" : "inherit"}
                                            >
                                                {getBasePrice().toLocaleString('vi-VN')} VNĐ
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
                                                    -{(getBasePrice() - calculateTotal()).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </HStack>
                                        )}
                                    </>
                                )}

                                <HStack justify="space-between">
                                    <Text>{t('booking.taxesFees')}</Text>
                                    <Text fontWeight="semibold">0 VNĐ</Text>
                                </HStack>
                                <Divider />
                                <HStack justify="space-between">
                                    <Heading as="h4" size="md">{t('booking.total')}</Heading>
                                    <Heading as="h4" size="md" color="teal.600">
                                        {calculateTotal().toLocaleString('vi-VN')} VNĐ
                                    </Heading>
                                </HStack>

                                {getRentalDays() === 0 && getRentalPeriod().hours === 0 && (
                                    <Text fontSize="xs" color="gray.500" textAlign="center">
                                        {t('bike.selectDatesToSeePricing')}
                                    </Text>
                                )}
                            </VStack>
                        </DrawerBody>

                        <DrawerFooter borderTopWidth="1px">
                            <Button
                                colorScheme="teal"
                                size="lg"
                                w="full"
                                onClick={() => {
                                    handleBookNow();
                                    onDrawerClose();
                                }}
                                isLoading={isSubmitting}
                                loadingText={t('booking.processing')}
                                isDisabled={!startDate || !endDate || bike.status !== 'available'}
                            >
                                {t('bike.bookNow')}
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </Container>
        </Box>
    );
};

export default BikeDetailsPage;
