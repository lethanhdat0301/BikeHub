import React, { useState, useEffect } from "react";
import { Box, Center, Heading, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
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
}

const BikeList: React.FC = () => {
    console.log("🔵 BikeList component rendered!");

    const [bikes, setBikes] = useState<Bike[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Default images to rotate through
    const defaultImages = [bike1, bike2, bike3];

    useEffect(() => {
        const fetchBikes = async () => {
            try {
                setLoading(true);
                console.log("🚴 Đang lấy dữ liệu xe từ database...");
                const data = await bikeService.getAllBikes();
                console.log("✅ Dữ liệu xe từ database:", data);
                console.log(`📊 Tổng số xe: ${data.length}`);
                // Add default images to bikes if they don't have one
                const bikesWithImages = data.map((bike, index) => ({
                    ...bike,
                    image: bike.image || defaultImages[index % defaultImages.length]
                }));
                setBikes(bikesWithImages);
                setError(null);
            } catch (err) {
                console.error("❌ Error loading bikes:", err);
                setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchBikes();
    }, []);

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
                        What we offer
                    </Heading>
                </Reveal>
                <Reveal>
                    <Heading
                        as="h1"
                        size={{ base: "xl", md: "3xl" }}
                        className="py-4"
                        color={"orange.500"}
                    >
                        Explore Our Bike Range
                    </Heading>
                </Reveal>
            </Center>

            <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={6}
                mt={5}
                className="w-4/5"
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
                            Hiện tại chưa có xe nào. Vui lòng quay lại sau.
                        </Text>
                    </Center>
                ) : (
                    bikes.map((bike) => (
                        <CardBike key={bike.id} bike={bike} />
                    ))
                )}
            </SimpleGrid>
        </Box>
    );
};

export default BikeList;