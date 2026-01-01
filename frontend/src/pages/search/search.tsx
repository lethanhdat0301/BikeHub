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
import bikeService from "../../services/bikeService";
import bike1 from "../../assets/images/bikes/bike1.jpg";
import bike2 from "../../assets/images/bikes/bike2.webp";
import bike3 from "../../assets/images/bikes/bike3.webp";

// Default images
const defaultImages = [bike1, bike2, bike3];

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [bikes, setBikes] = useState<any[]>([]);
    const [filteredBikes, setFilteredBikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [priceRange, setPriceRange] = useState<number[]>([0, 1000000]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedTransmission, setSelectedTransmission] = useState<string[]>([]);

    const parkId = searchParams.get("parkId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    useEffect(() => {
        const fetchBikes = async () => {
            setLoading(true);
            try {
                console.log("🔍 Đang tải xe từ database cho trang search...");

                let data;
                // Nếu có parkId, lọc theo park, nếu không lấy tất cả
                if (parkId) {
                    console.log(`🔍 Lọc xe theo park ID: ${parkId}`);
                    data = await bikeService.getBikesByPark(Number(parkId), 'available');
                    console.log(`✅ Đã tải ${data.length} xe từ park ${parkId}`);
                } else {
                    // Lấy tất cả xe có status available
                    data = await bikeService.getBikesByStatus('available');
                    console.log(`✅ Đã tải ${data.length} xe available`);
                }

                // Chỉ lấy 12 xe đầu tiên
                const limitedData = data.slice(0, 12).map((bike, index) => ({
                    ...bike,
                    image: bike.image || defaultImages[index % defaultImages.length],
                    type: bike.type || "Standard",
                    transmission: bike.transmission || "manual"
                }));

                console.log(`📊 Hiển thị ${limitedData.length} xe`);
                setBikes(limitedData);
                setFilteredBikes(limitedData);
            } catch (error) {
                console.error("❌ Error fetching bikes:", error);
                setBikes([]);
                setFilteredBikes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBikes();
    }, [parkId, startDate, endDate]);

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
                    {parkId && `Park ID: ${parkId}`}
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
                                Price Range (VNĐ/day)
                            </Text>
                            <RangeSlider
                                aria-label={["min", "max"]}
                                value={priceRange}
                                onChange={setPriceRange}
                                min={0}
                                max={1000000}
                                step={50000}
                            >
                                <RangeSliderTrack bg="teal.100">
                                    <RangeSliderFilledTrack bg="teal.500" />
                                </RangeSliderTrack>
                                <RangeSliderThumb index={0} />
                                <RangeSliderThumb index={1} />
                            </RangeSlider>
                            <HStack justify="space-between" mt={2}>
                                <Text fontSize="sm" color="gray.600">
                                    {priceRange[0].toLocaleString()} đ
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    {priceRange[1].toLocaleString()} đ
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
                        <SimpleGrid
                            columns={{ base: 1, md: 2, xl: 3 }}
                            spacing={{ base: 6, md: 8, xl: 10 }}
                            spacingX={{ base: 6, md: 8, xl: 12 }}
                            spacingY={{ base: 6, md: 8, xl: 10 }}
                        >
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