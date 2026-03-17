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
    useDisclosure,
    useBreakpointValue,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Badge,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useTranslation } from 'react-i18next';
import { useSearchParams } from "react-router-dom";
import CardBike from "../../components/home/bikes/cardBike.component";
import bikeService from "../../services/bikeService";
import bike1 from "../../assets/images/bikes/bike-placeholder.jpg";


const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [bikes, setBikes] = useState<any[]>([]);
    const [filteredBikes, setFilteredBikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Default filter open state: closed on mobile, open on desktop
    const isMobile = useBreakpointValue({ base: true, lg: false });
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
    const { t } = useTranslation();

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
                // console.log("🔍 Đang tải xe từ database cho trang search...");

                let data;
                // Nếu có parkId, lọc theo park, nếu không lấy tất cả
                if (parkId) {
                    // console.log(`🔍 Lọc xe theo park ID: ${parkId}`);
                    data = await bikeService.getBikesByPark(Number(parkId), 'available');
                    // console.log(`✅ Đã tải ${data.length} xe từ park ${parkId}`);
                } else {
                    // Lấy tất cả xe có status available
                    data = await bikeService.getBikesByStatus('available');
                    // console.log(`✅ Đã tải ${data.length} xe available`);
                }

                // Hiển thị tất cả xe với Google Cloud Storage URL
                const allBikes = data.map((bike) => ({
                    ...bike,
                    image: bike.image ? (bike.image.startsWith('http') ? bike.image : `https://storage.googleapis.com/bike_images/${bike.image}`) : bike1,
                }));

                // console.log(`📊 Hiển thị ${allBikes.length} xe`);
                setBikes(allBikes);
                setFilteredBikes(allBikes);
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
                    {t('bike.searchResults')}
                </Heading>
                <Text color="gray.600">
                    {parkId && `Park ID: ${parkId}`}
                    {startDate && ` | From: ${startDate}`}
                    {endDate && ` | To: ${endDate}`}
                </Text>
            </Box>

            <Flex gap={6} direction={{ base: "column", lg: "row" }} align="flex-start">
                {/* Mobile Filter Button - Sticky Top Bar */}
                <Box
                    display={{ base: "block", lg: "none" }}
                    position="sticky"
                    top={0}
                    left={0}
                    right={0}
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    zIndex={10}
                    py={3}
                    px={4}
                    boxShadow="sm"
                    mb={4}
                >
                    <HStack justify="space-between" gap={3}>
                        <Button
                            leftIcon={<ChevronDownIcon />}
                            onClick={onFilterOpen}
                            size="sm"
                            colorScheme="teal"
                            variant="solid"
                            flex={1}
                        >
                            {t('search.filters')}
                        </Button>
                        <Badge
                            bg="orange.500"
                            color="white"
                            px={3}
                            py={2}
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            {filteredBikes.length} {t('search.results')}
                        </Badge>
                    </HStack>
                </Box>

                {/* Bottom Sheet Drawer - Mobile Only */}
                <Drawer
                    isOpen={isFilterOpen}
                    placement="bottom"
                    onClose={onFilterClose}
                    size="full"
                >
                    <DrawerOverlay />
                    <DrawerContent borderTopRadius="2xl" maxH="85vh">
                        <DrawerHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                            <Flex justify="space-between" align="center">
                                <Heading size="md">{t('search.filters')}</Heading>
                                <DrawerCloseButton position="static" />
                            </Flex>
                        </DrawerHeader>

                        <DrawerBody overflowY="auto" py={4}>
                            <VStack
                                align="stretch"
                                spacing={6}
                                mb={6}
                            >
                                {/* Price Range Filter */}
                                <Box>
                                    <Text fontWeight="semibold" mb={3}>
                                        {t('search.priceRangeLabel')}
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
                                        {t('search.motorcycleType')}
                                    </Text>
                                    <CheckboxGroup
                                        colorScheme="teal"
                                        value={selectedTypes}
                                        onChange={(values) => setSelectedTypes(values as string[])}
                                    >
                                        <Stack spacing={2}>
                                            <Checkbox value="Electric Scooter">{t('search.filter.type.electricScooter')}</Checkbox>
                                            <Checkbox value="Scooter">{t('search.filter.type.scooter')}</Checkbox>
                                            <Checkbox value="Manual Bike">{t('search.filter.type.manualBike')}</Checkbox>
                                        </Stack>
                                    </CheckboxGroup>
                                </Box>

                                <Divider />

                                {/* Transmission Filter */}
                                <Box>
                                    <Text fontWeight="semibold" mb={3}>
                                        {t('search.transmission')}
                                    </Text>
                                    <CheckboxGroup
                                        colorScheme="teal"
                                        value={selectedTransmission}
                                        onChange={(values) => setSelectedTransmission(values as string[])}
                                    >
                                        <Stack spacing={2}>
                                            <Checkbox value="automatic">{t('search.filter.transmission.automatic')}</Checkbox>
                                            <Checkbox value="manual">{t('search.filter.transmission.manual')}</Checkbox>
                                        </Stack>
                                    </CheckboxGroup>
                                </Box>

                                {/* Bottom Sheet Action Buttons */}
                                <HStack gap={2} pt={4}>
                                    <Button
                                        width="full"
                                        variant="outline"
                                        colorScheme="teal"
                                        onClick={handleResetFilters}
                                        size="md"
                                    >
                                        {t('search.reset')}
                                    </Button>
                                    <Button
                                        width="full"
                                        colorScheme="teal"
                                        onClick={onFilterClose}
                                        size="md"
                                    >
                                        {t('search.apply')} ({filteredBikes.length})
                                    </Button>
                                </HStack>
                            </VStack>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                {/* Desktop Filters Sidebar - Always Visible */}
                <Box
                    w={{ base: "100%", lg: "300px" }}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="md"
                    h="fit-content"
                    position="sticky"
                    top="20px"
                    display={{ base: "none", lg: "block" }}
                >
                    {/* Filter Header */}
                    <Flex
                        justify="space-between"
                        align="center"
                        p={4}
                        bg="gray.50"
                        borderTopRadius="lg"
                    >
                        <Heading size="md">{t('search.filters')}</Heading>
                        <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="teal"
                            onClick={handleResetFilters}
                        >
                            {t('search.reset')}
                        </Button>
                    </Flex>

                    {/* Desktop Filter Content */}
                    <VStack
                        align="stretch"
                        spacing={6}
                        p={6}
                    >
                        {/* Price Range Filter */}
                        <Box>
                            <Text fontWeight="semibold" mb={3}>
                                {t('search.priceRangeLabel')}
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
                                {t('search.motorcycleType')}
                            </Text>
                            <CheckboxGroup
                                colorScheme="teal"
                                value={selectedTypes}
                                onChange={(values) => setSelectedTypes(values as string[])}
                            >
                                <Stack spacing={2}>
                                    <Checkbox value="Electric Scooter">{t('search.filter.type.electricScooter')}</Checkbox>
                                    <Checkbox value="Scooter">{t('search.filter.type.scooter')}</Checkbox>
                                    <Checkbox value="Manual Bike">{t('search.filter.type.manualBike')}</Checkbox>
                                </Stack>
                            </CheckboxGroup>
                        </Box>

                        <Divider />

                        {/* Transmission Filter */}
                        <Box>
                            <Text fontWeight="semibold" mb={3}>
                                {t('search.transmission')}
                            </Text>
                            <CheckboxGroup
                                colorScheme="teal"
                                value={selectedTransmission}
                                onChange={(values) => setSelectedTransmission(values as string[])}
                            >
                                <Stack spacing={2}>
                                    <Checkbox value="automatic">{t('search.filter.transmission.automatic')}</Checkbox>
                                    <Checkbox value="manual">{t('search.filter.transmission.manual')}</Checkbox>
                                </Stack>
                            </CheckboxGroup>
                        </Box>
                    </VStack>
                </Box>

                {/* Bikes Grid */}
                <Box flex={1}>
                    <Text mb={4} color="gray.600" fontWeight="medium">
                        {t('search.foundResults', { count: filteredBikes.length })}
                    </Text>

                    {loading ? (
                        <Center h="400px">
                            <Spinner size="xl" color="teal.500" />
                        </Center>
                    ) : filteredBikes.length === 0 ? (
                        <Center h="400px">
                            <VStack spacing={4}>
                                <Text fontSize="xl" color="gray.500">
                                    {t('search.noResults')}
                                </Text>
                                <Button colorScheme="teal" onClick={handleResetFilters}>
                                    {t('search.reset')}
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