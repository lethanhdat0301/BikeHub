import React from "react";
import { Box, Center, Heading, SimpleGrid } from "@chakra-ui/react";
import CardBike from "./cardBike.component";
import { Reveal } from "../../motion/reveal.component";
import bike1 from "../../../assets/images/bikes/bike1.jpg";
import bike2 from "../../../assets/images/bikes/bike2.webp";
import bike3 from "../../../assets/images/bikes/bike3.webp";

const BikeList: React.FC = () => {
    const bikes = [
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
        }
    ];

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
                {bikes.map((bike) => (
                    <CardBike key={bike.id} bike={bike} />
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default BikeList;