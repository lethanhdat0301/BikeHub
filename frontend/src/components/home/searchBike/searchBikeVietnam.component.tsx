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
    Skeleton,
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
    const [bgLoaded, setBgLoaded] = useState<boolean>(false);
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

    // Lazy load background image
    useEffect(() => {
        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => setBgLoaded(true);
        img.onerror = () => setBgLoaded(true); // still show content even if image fails
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
            minH={{ base: "300px", sm: "350px", md: "600px" }}
            display="flex"
            alignItems="center"
            width="100%"
            maxW="100vw"
            background={bgLoaded ? `url(${backgroundImage})` : "linear-gradient(135deg, #003b4f 0%, #001c3d 50%, #142846 100%)"}
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            backgroundAttachment="scroll"
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
            <Container maxW="container.xl" position="relative" zIndex={2} pt={{ base: 4, md: 0 }} px={{ base: 4, md: 4 }}>
                <VStack spacing={{ base: 3, md: 8 }} align="center">
                    {/* Hero Text Section - Compact on mobile */}
                    <VStack spacing={{ base: 2, md: 4 }} textAlign="center" display={{ base: "none", sm: "flex" }}>
                        <Heading
                            as="h1"
                            size={{ base: "md", md: "3xl", lg: "4xl" }}
                            color="white"
                            fontWeight="bold"
                            lineHeight={{ base: "1.2", md: "1.1" }}
                            textShadow="2px 2px 8px rgba(0,0,0,0.8)"
                            letterSpacing="-0.02em"
                        >
                            {t('home.heroTitle')}
                        </Heading>
                        <Text
                            fontSize={{ base: "xs", md: "2xl" }}
                            color="white"
                            fontWeight="medium"
                            maxW="3xl"
                            textShadow="2px 2px 6px rgba(0,0,0,0.8)"
                            lineHeight={{ base: "1.3", md: "1.4" }}
                            display={{ base: "none", md: "block" }}
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

                    {/* Search Form - Compact on mobile */}
                    <Box
                        bg="rgba(255, 255, 255, 0.92)"
                        backdropFilter="blur(8px)"
                        p={{ base: 2, sm: 3, md: 8, lg: 10 }}
                        borderRadius={{ base: "md", md: "3xl" }}
                        boxShadow="0 10px 24px -8px rgba(0, 50, 100, 0.22)"
                        w={{ base: "95%", md: "full" }}
                        maxW={{ base: "100%", sm: "450px", md: "1000px" }}
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
                            borderRadius: { base: "md", md: "3xl" },
                            zIndex: -1
                        }}
                    >
                        <VStack spacing={{ base: 1.5, sm: 3, md: 6 }}>
                            {/* Form Fields Container */}
                            <Flex
                                w="full"
                                direction={{ base: "column", md: "row", lg: "row" }}
                                gap={{ base: 2, md: 4, lg: 6 }}
                                align="flex-end"
                            >
                                {/* Location Field */}
                                <FormControl isRequired flex={{ base: "none", md: 1 }} minW={{ base: "full", md: "auto" }}>
                                    <FormLabel
                                        fontWeight="700"
                                        color="gray.800"
                                        fontSize={{ base: "xs", md: "md" }}
                                        mb={{ base: 1, md: 2 }}
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <Box color="blue.500">📍</Box>
                                        {t('home.pickupLocation')}
                                    </FormLabel>
                                    <Select
                                        placeholder={loading ? "Loading..." : t('home.selectLocation')}
                                        value={parkId}
                                        onChange={(e) => setParkId(e.target.value)}
                                        size="sm"
                                        borderColor="gray.300"
                                        borderWidth={{ base: "1px", md: "2px" }}
                                        borderRadius={{ base: "md", md: "lg" }}
                                        _hover={{ borderColor: "blue.400" }}
                                        _focus={{
                                            borderColor: "blue.500",
                                            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)"
                                        }}
                                        isDisabled={loading}
                                        bg="white"
                                        color="gray.700"
                                        fontWeight="500"
                                        h={{ base: "42px", md: "50px" }}
                                        fontSize={{ base: "xs", md: "md" }}
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
                                    spacing={{ base: 1.5, md: 4 }}
                                    w={{ base: "full", md: "auto" }}
                                    flex={{ base: "none", md: 1 }}
                                    flexDirection={{ base: "column", md: "row" }}
                                >
                                    <FormControl>
                                        <FormLabel
                                            fontWeight="700"
                                            color="gray.800"
                                            fontSize={{ base: "xs", md: "md" }}
                                            mb={{ base: 1, md: 2 }}
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Box color="blue.500">📅</Box>
                                            {t('home.startDate')}
                                        </FormLabel>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            size="sm"
                                            borderColor="gray.300"
                                            borderWidth={{ base: "1px", md: "2px" }}
                                            borderRadius={{ base: "md", md: "lg" }}
                                            _hover={{ borderColor: "blue.400" }}
                                            _focus={{
                                                borderColor: "blue.500",
                                                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)"
                                            }}
                                            bg="white"
                                            h={{ base: "42px", md: "50px" }}
                                            fontSize={{ base: "xs", md: "md" }}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel
                                            fontWeight="700"
                                            color="gray.800"
                                            fontSize={{ base: "xs", md: "md" }}
                                            mb={{ base: 1, md: 2 }}
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Box color="blue.500">📅</Box>
                                            {t('home.endDate')}
                                        </FormLabel>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            size="sm"
                                            borderColor="gray.300"
                                            borderWidth={{ base: "1px", md: "2px" }}
                                            borderRadius={{ base: "md", md: "lg" }}
                                            _hover={{ borderColor: "blue.400" }}
                                            _focus={{
                                                borderColor: "blue.500",
                                                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)"
                                            }}
                                            bg="white"
                                            h={{ base: "42px", md: "50px" }}
                                            fontSize={{ base: "xs", md: "md" }}
                                            min={startDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </FormControl>
                                </HStack>

                                {/* Search Button */}
                                <Button
                                    size="sm"
                                    px={{ base: 4, md: 8 }}
                                    h={{ base: "42px", md: "50px" }}
                                    leftIcon={<SearchIcon />}
                                    onClick={handleSearch}
                                    bgGradient="linear(to-r, blue.500, cyan.500)"
                                    color="white"
                                    borderRadius={{ base: "md", md: "lg" }}
                                    fontSize={{ base: "xs", md: "md" }}
                                    fontWeight="700"
                                    _hover={{
                                        bgGradient: "linear(to-r, blue.600, cyan.600)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 10px 16px -5px rgba(59, 130, 246, 0.24)",
                                    }}
                                    _active={{
                                        transform: "translateY(-1px)"
                                    }}
                                    transition="all 0.2s ease"
                                    w={{ base: "full", md: "auto" }}
                                    minW={{ base: "auto", md: "180px" }}
                                    boxShadow="0 6px 10px -3px rgba(59, 130, 246, 0.16)"
                                >
                                    {t('home.findMotorbike')}
                                </Button>
                            </Flex>

                            {/* Same-day booking info */}
                            <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                color="gray.500"
                                textAlign="center"
                                fontStyle="italic"
                                mt={{ base: 0.5, md: 1 }}
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