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

// Default images nếu xe không có ảnh
const defaultImages = [bike1, bike2, bike3];

// Mock data để hiển thị khi database trống
const mockBikes: Bike[] = [
    {
        id: 1,
        model: "Mountain Bike Pro",
        status: "AVAILABLE",
        lock: false,
        location: "Downtown",
        price: 50,
        park_id: 1,
        image: bike1
    },
    {
        id: 2,
        model: "City Cruiser",
        status: "AVAILABLE",
        lock: false,
        location: "Beach Area",
        price: 30,
        park_id: 2,
        image: bike2
    },
    {
        id: 3,
        model: "Sport Racing",
        status: "AVAILABLE",
        lock: false,
        location: "Mountain Trail",
        price: 70,
        park_id: 3,
        image: bike3
    },
    {
        id: 4,
        model: "Urban Commuter",
        status: "AVAILABLE",
        lock: false,
        location: "City Center",
        price: 40,
        park_id: 1,
        image: bike1
    },
    {
        id: 5,
        model: "Electric Bike",
        status: "AVAILABLE",
        lock: false,
        location: "Riverside",
        price: 80,
        park_id: 2,
        image: bike2
    },
    {
        id: 6,
        model: "Folding Bike",
        status: "AVAILABLE",
        lock: false,
        location: "Station",
        price: 35,
        park_id: 3,
        image: bike3
    }
];

const BikeList: React.FC = () => {
    console.log("🔵 BikeList component rendered!");

    const [bikes, setBikes] = useState<Bike[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBikes = async () => {
            try {
                setLoading(true);
                console.log("🚴 Đang lấy xe từ database...");
                console.log("🔗 API URL:", import.meta.env.VITE_BACK_END_PROD);
                
                // Thử lấy tất cả bikes trước
                let data = await bikeService.getAllBikes();
                console.log("✅ Tất cả xe từ database:", data);
                console.log(`📊 Tổng số xe: ${data.length}`);
                
                // Kiểm tra status của xe đầu tiên
                if (data && data.length > 0) {
                    console.log("🔍 Status của xe đầu tiên:", data[0].status);
                    console.log("🔍 Xe đầu tiên:", data[0]);
                    
                    // Lấy danh sách các status khác nhau
                    const statuses = [...new Set(data.map(bike => bike.status))];
                    console.log("🔍 Các status có trong database:", statuses);
                }

                // Nếu có dữ liệu, lọc theo status (case-insensitive) và giới hạn 6
                if (data && data.length > 0) {
                    const availableBikes = data.filter(bike => 
                        bike.status && bike.status.toLowerCase() === "available"
                    );
                    console.log(`✅ Xe available: ${availableBikes.length}`);
                    
                    if (availableBikes.length > 0) {
                        data = availableBikes.slice(0, 6);
                    } else {
                        // Nếu không có xe available, lấy 6 xe bất kỳ
                        console.log("⚠️ Không có xe available, lấy 6 xe đầu tiên");
                        data = data.slice(0, 6);
                    }
                } else {
                    console.log("⚠️ Database trống, sử dụng mock data");
                    data = mockBikes;
                }

                // Thêm ảnh mặc định nếu cần
                const bikesWithImages = data.map((bike, index) => ({
                    ...bike,
                    image: bike.image || defaultImages[index % defaultImages.length]
                }));

                setBikes(bikesWithImages);
                setError(null);
            } catch (err: any) {
                console.error("❌ Error loading bikes:", err);
                console.error("❌ Error details:", err.response?.data || err.message);
                console.log("⚠️ Lỗi khi tải từ API, sử dụng mock data");
                // Nếu có lỗi, dùng mock data
                setBikes(mockBikes);
                setError(null);
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