import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    Spinner,
    Center,
    VStack,
    HStack,
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    Checkbox,
    CheckboxGroup,
    Stack,
    Divider,
    Button,
    Flex,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import CardBike from "../../components/home/bikes/cardBike.component";
import bike1 from "../../assets/images/bikes/bike1.jpg";
import bike2 from "../../assets/images/bikes/bike2.webp";
import bike3 from "../../assets/images/bikes/bike3.webp";

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [bikes, setBikes] = useState<any[]>([]);
    const [filteredBikes, setFilteredBikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedTransmission, setSelectedTransmission] = useState<string[]>([]);

    const location = searchParams.get("location");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Mock data for bikes
    const mockBikes = [
        {
            id: 1,
            model: "Honda SH 150i",
            status: "AVAILABLE",
            lock: false,
            location: "phu-quoc",
            price: 50,
            park_id: 1,
            image: bike1,
            type: "Scooter",
            transmission: "automatic"
        },
        {
            id: 2,
            model: "Yamaha Exciter 155",
            status: "AVAILABLE",
            lock: false,
            location: "phu-quoc",
            price: 35,
            park_id: 2,
            image: bike2,
            type: "Standard",
            transmission: "manual"
        },
        {
            id: 3,
            model: "Honda Wave Alpha",
            status: "AVAILABLE",
            lock: false,
            location: "nha-trang",
            price: 25,
            park_id: 3,
            image: bike3,
            type: "Standard",
            transmission: "manual"
        },
        {
            id: 4,
            model: "Honda Winner X",
            status: "AVAILABLE",
            lock: false,
            location: "phu-quoc",
            price: 45,
            park_id: 1,
            image: bike1,
            type: "Standard",
            transmission: "manual"
        },
        {
            id: 5,
            model: "Yamaha NVX 155",
            status: "AVAILABLE",
            lock: false,
            location: "nha-trang",
            price: 40,
            park_id: 2,
            image: bike2,
            type: "Scooter",
            transmission: "automatic"
        },
        {
            id: 6,
            model: "Honda Air Blade",
            status: "AVAILABLE",
            lock: false,
            location: "phu-quoc",
            price: 55,
            park_id: 3,
            image: bike3,
            type: "Scooter",
            transmission: "automatic"
        },
    ];

    useEffect(() => {
        const fetchBikes = async () => {
            setLoading(true);
            try {
                // Use mock data instead of API call
                let filteredData = mockBikes;

                // Filter by location if provided
                if (location && location !== "") {
                    filteredData = filteredData.filter(bike => bike.location === location);
                }

                setBikes(filteredData);
                setFilteredBikes(filteredData);
            } catch (error) {
                console.error("Error fetching bikes:", error);
                setBikes([]);
                setFilteredBikes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBikes();
    }, [location, startDate, endDate]);

    // Apply filters
    useEffect(() => {
        let filtered = [...bikes];

        // Filter by price range
        filtered = filtered.filter(
            bike => bike.price >= priceRange[0] && bike.price <= priceRange[1]
        );

        // Filter by motorcycle type
        if (selectedTypes.length > 0) {
            filtered = filtered.filter(bike => selectedTypes.includes(bike.type));
        }

        // Filter by transmission
        if (selectedTransmission.length > 0) {
            filtered = filtered.filter(bike => selectedTransmission.includes(bike.transmission));
        }

        setFilteredBikes(filtered);
    }, [priceRange, selectedTypes, selectedTransmission, bikes]);

    const handleResetFilters = () => {
        setPriceRange([0, 100]);
        setSelectedTypes([]);
        setSelectedTransmission([]);
    };

    return (
        <Container maxW="container.xl" py={10}>
            <Box mb={8}>
                <Heading size="xl" mb={2}>
                    Search Results
                </Heading>
                <Text color="gray.600">
                    {location && `Location: ${location}`}
                    {startDate && ` | From: ${startDate}`}
                    {endDate && ` | To: ${endDate}`}
                </Text>
            </Box>

            <Flex gap={6} direction={{ base: "column", lg: "row" }}>
                {/* Filters Sidebar */}
                <Box
                    w={{ base: "100%", lg: "300px" }}
                    bg="white"
                    p={6}
                    borderRadius="lg"
                    boxShadow="md"
                    h="fit-content"
                    position={{ base: "relative", lg: "sticky" }}
                    top={{ lg: "20px" }}
                >
                    <VStack align="stretch" spacing={6}>
                        <Flex justify="space-between" align="center">
                            <Heading size="md">Filters</Heading>
                            <Button size="sm" variant="ghost" colorScheme="teal" onClick={handleResetFilters}>
                                Reset
                            </Button>
                        </Flex>

                        <Divider />

                        {/* Price Range Filter */}
                        <Box>
                            <Text fontWeight="semibold" mb={3}>
                                Price Range ($/day)
                            </Text>
                            <RangeSlider
                                aria-label={["min", "max"]}
                                value={priceRange}
                                onChange={setPriceRange}
                                min={0}
                                max={100}
                                step={5}
                            >
                                <RangeSliderTrack bg="teal.100">
                                    <RangeSliderFilledTrack bg="teal.500" />
                                </RangeSliderTrack>
                                <RangeSliderThumb index={0} />
                                <RangeSliderThumb index={1} />
                            </RangeSlider>
                            <HStack justify="space-between" mt={2}>
                                <Text fontSize="sm" color="gray.600">
                                    ${priceRange[0]}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    ${priceRange[1]}
                                </Text>
                            </HStack>
                        </Box>

                        <Divider />

                        {/* Motorcycle Type Filter */}
                        <Box>
                            <Text fontWeight="semibold" mb={3}>
                                Motorcycle Type
                            </Text>
                            <CheckboxGroup
                                colorScheme="teal"
                                value={selectedTypes}
                                onChange={(values) => setSelectedTypes(values as string[])}
                            >
                                <Stack spacing={2}>
                                    <Checkbox value="Scooter">Scooter</Checkbox>
                                    <Checkbox value="Dirt Bike">Dirt Bike</Checkbox>
                                    <Checkbox value="Standard">Standard</Checkbox>
                                    <Checkbox value="Touring">Touring</Checkbox>
                                </Stack>
                            </CheckboxGroup>
                        </Box>

                        <Divider />

                        {/* Transmission Filter */}
                        <Box>
                            <Text fontWeight="semibold" mb={3}>
                                Transmission
                            </Text>
                            <CheckboxGroup
                                colorScheme="teal"
                                value={selectedTransmission}
                                onChange={(values) => setSelectedTransmission(values as string[])}
                            >
                                <Stack spacing={2}>
                                    <Checkbox value="automatic">Automatic</Checkbox>
                                    <Checkbox value="manual">Manual</Checkbox>
                                </Stack>
                            </CheckboxGroup>
                        </Box>
                    </VStack>
                </Box>

                {/* Bikes Grid */}
                <Box flex={1}>
                    <Text mb={4} color="gray.600" fontWeight="medium">
                        Found {filteredBikes.length} motorcycle{filteredBikes.length !== 1 ? "s" : ""}
                    </Text>

                    {loading ? (
                        <Center h="400px">
                            <Spinner size="xl" color="teal.500" />
                        </Center>
                    ) : filteredBikes.length === 0 ? (
                        <Center h="400px">
                            <VStack spacing={4}>
                                <Text fontSize="xl" color="gray.500">
                                    No motorcycles found for your search criteria
                                </Text>
                                <Button colorScheme="teal" onClick={handleResetFilters}>
                                    Reset Filters
                                </Button>
                            </VStack>
                        </Center>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                            {filteredBikes.map((bike: any) => (
                                <CardBike key={bike.id} bike={bike} />
                            ))}
                        </SimpleGrid>
                    )}
                </Box>
            </Flex>
        </Container>
    );
};

export default SearchPage;