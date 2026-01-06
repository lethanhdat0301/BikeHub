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
    Collapse,
    IconButton,
    useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
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
    const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure({ defaultIsOpen: true });

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

        // Filter by fuel type (using as type proxy)
        if (selectedTypes.length > 0) {
            filtered = filtered.filter(bike => {
                const bikeType = bike.fuel_type || 'gasoline';
                return selectedTypes.some(type => {
                    if (type === 'Electric Scooter') return bikeType === 'electric';
                    if (type === 'Scooter') return bike.transmission === 'automatic';
                    if (type === 'Manual Bike') return bike.transmission === 'manual';
                    return true;
                });
            });
        }

        // Filter by transmission
        if (selectedTransmission.length > 0) {
            filtered = filtered.filter(bike => {
                const trans = bike.transmission?.toLowerCase() || 'automatic';
                return selectedTransmission.some(t => t.toLowerCase() === trans);
            });
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
                    borderRadius="lg"
                    boxShadow="md"
                    h="fit-content"
                    position={{ base: "relative", lg: "sticky" }}
                    top={{ lg: "20px" }}
                >
                    {/* Filter Header - Always Visible */}
                    <Flex
                        justify="space-between"
                        align="center"
                        p={4}
                        cursor={{ base: "pointer", lg: "default" }}
                        onClick={{ base: onFilterToggle, lg: undefined }}
                        bg="gray.50"
                        borderTopRadius="lg"
                        _hover={{ base: { bg: "gray.100" }, lg: { bg: "gray.50" } }}
                    >
                        <HStack>
                            <Heading size="md">Filters</Heading>
                            <IconButton
                                aria-label="Toggle filters"
                                icon={isFilterOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                size="sm"
                                variant="ghost"
                                display={{ base: "flex", lg: "none" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFilterToggle();
                                }}
                            />
                        </HStack>
                        <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="teal"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleResetFilters();
                            }}
                        >
                            Reset
                        </Button>
                    </Flex>

                    {/* Filter Content - Collapsible on Mobile */}
                    <Collapse in={isFilterOpen} animateOpacity>
                        <VStack align="stretch" spacing={6} p={6}>
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
                                        <Checkbox value="Electric Scooter">Electric Scooter</Checkbox>
                                        <Checkbox value="Scooter">Automatic Scooter</Checkbox>
                                        <Checkbox value="Manual Bike">Manual Bike</Checkbox>
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
                    </Collapse>
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
                                <CardBike
                                    key={bike.id}
                                    bike={bike}
                                    searchStartDate={startDate || undefined}
                                    searchEndDate={endDate || undefined}
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </Box>
            </Flex>
        </Container>
    );
};

export default SearchPage;