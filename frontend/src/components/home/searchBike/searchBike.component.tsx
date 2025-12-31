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
    useColorModeValue,
    Spinner,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { getAllParks, Park } from "../../../services/parkService";

const SearchBike: React.FC = () => {
    const [parkId, setParkId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [parks, setParks] = useState<Park[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const bgGradient = useColorModeValue(
        "linear(to-r, teal.400, teal.600)",
        "linear(to-r, teal.600, teal.800)"
    );

    // Lấy danh sách parks khi component mount
    useEffect(() => {
        const fetchParks = async () => {
            try {
                setLoading(true);
                const data = await getAllParks();
                setParks(data);
                console.log("🏞️ Parks loaded:", data);
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

        console.log("Searching for bikes:", { parkId, startDate, endDate });

        // Navigate to search results with parkId
        const params = new URLSearchParams();
        if (parkId) params.append("parkId", parkId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        navigate(`/search?${params.toString()}`);
    };

    return (
        <Box
            bgGradient={bgGradient}
            py={{ base: 16, md: 24 }}
            px={4}
            minH="500px"
            display="flex"
            alignItems="center"
            width="100%"
            maxW="100vw"
            overflowX="hidden"
        >
            <Container maxW="container.lg">
                <VStack spacing={8} align="center">
                    <VStack spacing={3}>
                        <Heading
                            as="h1"
                            size={{ base: "xl", md: "2xl" }}
                            color="white"
                            textAlign="center"
                            fontWeight="extrabold"
                        >
                            Your Next Ride, Just a Click Away
                        </Heading>
                        <Heading
                            as="h2"
                            size={{ base: "sm", md: "md" }}
                            color="whiteAlpha.900"
                            textAlign="center"
                            fontWeight="normal"
                            maxW="2xl"
                        >
                            Rent the perfect motorcycle for your adventure in Vietnam. Easy, fast, reliable, and secure.
                        </Heading>
                    </VStack>

                    <Box
                        bg="white"
                        p={{ base: 6, md: 8 }}
                        borderRadius="xl"
                        boxShadow="2xl"
                        w="full"
                        maxW="800px"
                    >
                        <VStack spacing={6}>
                            <HStack
                                spacing={4}
                                w="full"
                                flexDirection={{ base: "column", md: "row" }}
                                alignItems="flex-end"
                            >
                                <FormControl isRequired>
                                    <FormLabel fontWeight="semibold" color="gray.700">
                                        Park
                                    </FormLabel>
                                    <Select
                                        placeholder={loading ? "Loading parks..." : "Select a park"}
                                        value={parkId}
                                        onChange={(e) => setParkId(e.target.value)}
                                        size="lg"
                                        borderColor="teal.300"
                                        _hover={{ borderColor: "teal.500" }}
                                        focusBorderColor="teal.500"
                                        isDisabled={loading}
                                        icon={loading ? <Spinner size="sm" /> : undefined}
                                    >
                                        {parks.map((park) => (
                                            <option key={park.id} value={park.id.toString()}>
                                                {park.name} - {park.location}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontWeight="semibold" color="gray.700">
                                        Start Date
                                    </FormLabel>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        size="lg"
                                        borderColor="teal.300"
                                        _hover={{ borderColor: "teal.500" }}
                                        focusBorderColor="teal.500"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontWeight="semibold" color="gray.700">
                                        End Date
                                    </FormLabel>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        size="lg"
                                        borderColor="teal.300"
                                        _hover={{ borderColor: "teal.500" }}
                                        focusBorderColor="teal.500"
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </FormControl>
                            </HStack>

                            <Button
                                colorScheme="teal"
                                size="lg"
                                w={{ base: "full", md: "auto" }}
                                px={12}
                                leftIcon={<SearchIcon />}
                                onClick={handleSearch}
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg",
                                }}
                                transition="all 0.2s"
                            >
                                Find a Motorcycle
                            </Button>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default SearchBike;
