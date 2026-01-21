import React, { useState, useEffect } from "react";
import { Box, Center, Heading, SimpleGrid, Spinner, Text, Button, HStack, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import CardBike from "./cardBike.component";
import { Reveal } from "../../motion/reveal.component";
import bikeService from "../../../services/bikeService";
import bike1 from "../../../assets/images/bikes/bike1.jpg";
import bike2 from "../../../assets/images/bikes/bike2.webp";
import bike3 from "../../../assets/images/bikes/bike3.webp";

interface Bike {
    id: number;
    model: string;
    status: string;
    lock: boolean;
    location: string;
    price: number;
    park_id: number;
    image?: string;
    license_plate?: string;
}

// Placeholder image
const placeholderImage = bike1;

const BikeList: React.FC = () => {
    // console.log("🔵 BikeList component rendered!");
    const { t } = useTranslation();

    const [bikes, setBikes] = useState<Bike[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6; // 6 xe mỗi trang (2x3 grid trên desktop, 2x3 trên mobile)

    useEffect(() => {
        const fetchBikes = async () => {
            try {
                setLoading(true);
                // console.log("🚴 Đang lấy xe từ database...");

                let data = await bikeService.getBikesByStatus('available', 20); // Lấy nhiều xe hơn để phân trang

                if (!data || (Array.isArray(data) && data.length === 0)) {
                    console.warn("⚠️ API trả về rỗng, không có xe");
                    setBikes([]);
                    setError(null);
                    setLoading(false);
                    return;
                }

                // Xử lý ảnh giống bikeDetails - sử dụng Google Cloud Storage
                const bikesWithImages = data.map((bike: any) => ({
                    ...bike,
                    image: bike.image ? `https://storage.googleapis.com/bike_images/${bike.image}` : placeholderImage
                }));

                setBikes(bikesWithImages);
                setError(null);
            } catch (err: any) {
                console.error("❌ Error loading bikes:", err);
                console.error("❌ Error details:", err.response?.data || err.message);
                setBikes([]);
                setError("Failed to load bikes. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchBikes();
    }, []);

    // Tính toán pagination
    const totalPages = Math.ceil(bikes.length / itemsPerPage);
    const indexOfLastBike = currentPage * itemsPerPage;
    const indexOfFirstBike = indexOfLastBike - itemsPerPage;
    const currentBikes = bikes.slice(indexOfFirstBike, indexOfLastBike);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Scroll to top of bike list
        document.getElementById("weOffer")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <Box
            id="weOffer"
            minHeight={"80vh"}
            className="relative flex flex-col items-center justify-center gap-4 my-4"
            gap={4}
        >
            <Box
                className="absolute w-3/5 h-full top-0 right-0 bg-teal-100 opacity-25"
                clipPath={"circle(60% at 80% 13%)"}
            />
            <Box
                className="absolute w-1/6 h-full bottom-1 left-1 bg-teal-100 opacity-25"
                clipPath={"circle(25% at 54% 74%)"}
            />

            <Center mt={100} justifyContent={"center"} flexDirection={"column"}>
                <Reveal>
                    <Heading as="h3" size={{ base: "sm", md: "xl" }} className="capitalize">
                        {t('home.whatWeOffer')}
                    </Heading>
                </Reveal>
                <Reveal>
                    <Heading
                        as="h1"
                        size={{ base: "xl", md: "3xl" }}
                        className="py-4"
                        color={"orange.500"}
                    >
                        {t('home.exploreOurBikeRange')}
                    </Heading>
                </Reveal>
            </Center>

            <SimpleGrid
                columns={{ base: 2, md: 2, lg: 3 }}
                spacing={{ base: 2, md: 6, lg: 8 }}
                gap={{ base: 2, md: 6, lg: 8 }}
                mt={5}
                className="w-full md:w-4/5"
                px={{ base: 2, md: 0 }}
            >
                {loading ? (
                    <Center gridColumn="1 / -1" py={10}>
                        <Spinner size="xl" color="orange.500" thickness="4px" />
                    </Center>
                ) : error ? (
                    <Center gridColumn="1 / -1" py={10}>
                        <Text color="red.500" fontSize="lg">{error}</Text>
                    </Center>
                ) : bikes.length === 0 ? (
                    <Center gridColumn="1 / -1" py={10}>
                        <Text fontSize="lg" color="gray.500">
                            {t('home.noBikesAvailable')}
                        </Text>
                    </Center>
                ) : (
                    currentBikes.map((bike) => (
                        <CardBike key={bike.id} bike={bike} />
                    ))
                )}
            </SimpleGrid>

            {/* Pagination Controls */}
            {!loading && !error && bikes.length > 0 && totalPages > 1 && (
                <Box mt={8} mb={4}>
                    <HStack spacing={2} justifyContent="center" flexWrap="wrap">
                        {/* Previous Button */}
                        <IconButton
                            aria-label="Previous page"
                            icon={<ChevronLeftIcon />}
                            onClick={() => handlePageChange(currentPage - 1)}
                            isDisabled={currentPage === 1}
                            colorScheme="teal"
                            variant="outline"
                            size={{ base: "sm", md: "md" }}
                        />

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <Button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                colorScheme={currentPage === pageNum ? "orange" : "gray"}
                                variant={currentPage === pageNum ? "solid" : "outline"}
                                size={{ base: "sm", md: "md" }}
                                minW={{ base: "40px", md: "44px" }}
                            >
                                {pageNum}
                            </Button>
                        ))}

                        {/* Next Button */}
                        <IconButton
                            aria-label="Next page"
                            icon={<ChevronRightIcon />}
                            onClick={() => handlePageChange(currentPage + 1)}
                            isDisabled={currentPage === totalPages}
                            colorScheme="teal"
                            variant="outline"
                            size={{ base: "sm", md: "md" }}
                        />
                    </HStack>

                    {/* Page Info */}
                    <Text textAlign="center" mt={3} fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                        Page {currentPage} / {totalPages} • Total {bikes.length} motorbikes
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default BikeList;