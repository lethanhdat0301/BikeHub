import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Select,
    Button,
    FormControl,
    FormLabel,
    Input,
    Text,
    Flex,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { getAllParks, Park } from "../../../services/parkService";
import backgroundImage from "../../../assets/images/background.png";

const SearchBikeVietnam: React.FC = () => {
    const [parkId, setParkId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [parks, setParks] = useState<Park[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Lấy danh sách parks khi component mount
    useEffect(() => {
        const fetchParks = async () => {
            try {
                setLoading(true);
                const data = await getAllParks();
                setParks(data);
                // console.log("🏞️ Parks loaded:", data);
            } catch (error) {
                console.error("❌ Error loading parks:", error);
                // Nếu API lỗi, có thể dùng mock data
                setParks([
                    { id: 1, name: "Phu Quoc Park", location: "Phu Quoc", created_at: new Date(), updated_at: new Date() },
                    { id: 2, name: "Nha Trang Park", location: "Nha Trang", created_at: new Date(), updated_at: new Date() }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchParks();
    }, []);

    const handleSearch = () => {
        if (!parkId) {
            alert("Please select a location");
            return;
        }

        // console.log("Searching for bikes:", { parkId, startDate, endDate });

        // Navigate to search results with parkId
        const params = new URLSearchParams();
        if (parkId) params.append("parkId", parkId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        navigate(`/search?${params.toString()}`);
    };

    return (
        <Box
            position="relative"
            minH={{ base: "550px", md: "750px" }}
            display="flex"
            alignItems="center"
            width="100%"
            maxW="100vw"
            overflowX="hidden"
            backgroundImage={`url(${backgroundImage})`}
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(0, 50, 80, 0.3) 0%, rgba(0, 30, 60, 0.5) 50%, rgba(20, 40, 70, 0.4) 100%)",
                zIndex: 1
            }}
        >
            <Container maxW="container.xl" position="relative" zIndex={2} pt={{ base: 6, md: 0 }} px={{ base: 4, md: 4 }}>
                <VStack spacing={{ base: 6, md: 12 }} align="center">
                    {/* Hero Text Section */}
                    <VStack spacing={{ base: 3, md: 6 }} textAlign="center">
                        <Heading
                            as="h1"
                            size={{ base: "lg", md: "3xl", lg: "4xl" }}
                            color="white"
                            fontWeight="bold"
                            lineHeight={{ base: "1.2", md: "1.1" }}
                            textShadow="2px 2px 8px rgba(0,0,0,0.8)"
                            letterSpacing="-0.02em"
                        >
                            {t('home.heroTitle')}
                        </Heading>
                        <Text
                            fontSize={{ base: "sm", md: "2xl" }}
                            color="white"
                            fontWeight="medium"
                            maxW="3xl"
                            textShadow="2px 2px 6px rgba(0,0,0,0.8)"
                            lineHeight={{ base: "1.3", md: "1.4" }}
                        >
                            {t('home.heroTagline')}
                        </Text>
                        {/* <HStack
                            spacing={8}
                            justify="center"
                            flexWrap="wrap"
                            color="white"
                            fontSize="md"
                            fontWeight="medium"
                        >
                            <HStack>
                                <Text>✨</Text>
                                <Text>Premium Fleet</Text>
                            </HStack>
                            <HStack>
                                <Text>🛡️</Text>
                                <Text>Full Insurance</Text>
                            </HStack>
                            <HStack>
                                <Text>📍</Text>
                                <Text>Multiple Locations</Text>
                            </HStack>
                        </HStack> */}
                    </VStack>

                    {/* Search Form */}
                    <Box
                        bg="rgba(255, 255, 255, 0.92)"
                        backdropFilter="blur(25px)"
                        p={{ base: 3.5, md: 10, lg: 12 }}
                        borderRadius={{ base: "lg", md: "3xl" }}
                        boxShadow="0 20px 40px -10px rgba(0, 50, 100, 0.3)"
                        w={{ base: "80%", md: "full" }}
                        maxW={{ base: "450px", md: "1000px" }}
                        border={{ base: "1px solid", md: "2px solid" }}
                        borderColor="rgba(255,255,255,0.4)"
                        position="relative"
                        _before={{
                            content: '""',
                            position: "absolute",
                            top: "-3px",
                            left: "-3px",
                            right: "-3px",
                            bottom: "-3px",
                            background: "linear-gradient(135deg, rgba(56, 178, 172, 0.2), rgba(59, 130, 246, 0.15))",
                            borderRadius: { base: "2xl", md: "3xl" },
                            zIndex: -1
                        }}
                    >
                        <VStack spacing={{ base: 2.5, md: 8 }}>
                            {/* Form Fields Container */}
                            <Flex
                                w="full"
                                direction={{ base: "column", lg: "row" }}
                                gap={{ base: 2.5, md: 6 }}
                                align="flex-end"
                            >
                                {/* Location Field */}
                                <FormControl isRequired flex={{ base: "none", lg: 1 }}>
                                    <FormLabel
                                        fontWeight="700"
                                        color="gray.800"
                                        fontSize={{ base: "xs", md: "md" }}
                                        mb={{ base: 1.5, md: 3 }}
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                    >
                                        <Box color="blue.500">📍</Box>
                                        {t('home.pickupLocation')}
                                    </FormLabel>
                                    <Select
                                        placeholder={loading ? "Loading locations..." : t('home.selectLocation')}
                                        value={parkId}
                                        onChange={(e) => setParkId(e.target.value)}
                                        size="md"
                                        borderColor="gray.300"
                                        borderWidth={{ base: "1px", md: "2px" }}
                                        borderRadius={{ base: "lg", md: "xl" }}
                                        _hover={{ borderColor: "blue.400" }}
                                        _focus={{
                                            borderColor: "blue.500",
                                            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)"
                                        }}
                                        isDisabled={loading}
                                        bg="white"
                                        color="gray.700"
                                        fontWeight="500"
                                        h={{ base: "42px", md: "60px" }}
                                        fontSize={{ base: "sm", md: "md" }}
                                    >
                                        {parks.map((park) => (
                                            <option key={park.id} value={park.id.toString()}>
                                                {park.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Date Fields */}
                                <HStack
                                    spacing={{ base: 2.5, md: 6 }}
                                    w={{ base: "full", lg: "auto" }}
                                    flex={{ base: "none", lg: 1 }}
                                    flexDirection={{ base: "column", md: "row" }}
                                >
                                    <FormControl>
                                        <FormLabel
                                            fontWeight="700"
                                            color="gray.800"
                                            fontSize={{ base: "xs", md: "md" }}
                                            mb={{ base: 1.5, md: 3 }}
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                        >
                                            <Box color="blue.500">📅</Box>
                                            {t('home.startDate')}
                                        </FormLabel>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            size="md"
                                            borderColor="gray.300"
                                            borderWidth={{ base: "1px", md: "2px" }}
                                            borderRadius={{ base: "lg", md: "xl" }}
                                            _hover={{ borderColor: "blue.400" }}
                                            _focus={{
                                                borderColor: "blue.500",
                                                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)"
                                            }}
                                            bg="white"
                                            h={{ base: "42px", md: "60px" }}
                                            fontSize={{ base: "sm", md: "md" }}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel
                                            fontWeight="700"
                                            color="gray.800"
                                            fontSize={{ base: "xs", md: "md" }}
                                            mb={{ base: 1.5, md: 3 }}
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                        >
                                            <Box color="blue.500">📅</Box>
                                            {t('home.endDate')}
                                        </FormLabel>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            size="md"
                                            borderColor="gray.300"
                                            borderWidth={{ base: "1px", md: "2px" }}
                                            borderRadius={{ base: "lg", md: "xl" }}
                                            _hover={{ borderColor: "blue.400" }}
                                            _focus={{
                                                borderColor: "blue.500",
                                                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)"
                                            }}
                                            bg="white"
                                            h={{ base: "42px", md: "60px" }}
                                            fontSize={{ base: "sm", md: "md" }}
                                            min={startDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </FormControl>
                                </HStack>

                                {/* Search Button */}
                                <Button
                                    size="md"
                                    px={{ base: 5, md: 10 }}
                                    h={{ base: "42px", md: "60px" }}
                                    leftIcon={<SearchIcon />}
                                    onClick={handleSearch}
                                    bgGradient="linear(to-r, blue.500, cyan.500)"
                                    color="white"
                                    borderRadius={{ base: "lg", md: "xl" }}
                                    fontSize={{ base: "sm", md: "lg" }}
                                    fontWeight="700"
                                    _hover={{
                                        bgGradient: "linear(to-r, blue.600, cyan.600)",
                                        transform: "translateY(-3px)",
                                        boxShadow: "0 25px 30px -8px rgba(59, 130, 246, 0.4), 0 15px 15px -8px rgba(6, 182, 212, 0.3)",
                                    }}
                                    _active={{
                                        transform: "translateY(-1px)"
                                    }}
                                    transition="all 0.3s ease"
                                    w={{ base: "full", lg: "auto" }}
                                    minW={{ base: "auto", md: "250px" }}
                                    boxShadow="0 15px 20px -5px rgba(59, 130, 246, 0.3), 0 8px 10px -5px rgba(6, 182, 212, 0.2)"
                                >
                                    {t('home.findMotorbike')}
                                </Button>
                            </Flex>

                            {/* Same-day booking info */}
                            <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                color="gray.600"
                                textAlign="center"
                                fontStyle="italic"
                            >
                                ✨ {t('home.rentalBonus')}
                            </Text>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default SearchBikeVietnam;