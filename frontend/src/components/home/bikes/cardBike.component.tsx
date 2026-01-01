import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useDisclosure,
  Badge,
  HStack,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "../../motion/reveal.component";
import bikeImage from "../../../assets/images/bikes/bike1.jpg";
import { FaStar, FaHeart, FaGasPump, FaBolt, FaUsers } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import BikeDetails from "./bikeDetails.component";

export type Bike = {
  id: number;
  model: string;
  status: string;
  lock: boolean;
  location: string;
  price: number;
  image: string;
  code?: string;
  description?: string;
  images?: string[];
  // Extended fields from database
  rating?: number;
  review_count?: number;
  dealer_name?: string;
  dealer_contact?: string;
  seats?: number;
  fuel_type?: string;
  transmission?: string;
  Park?: {
    id: number;
    name: string;
    location: string;
  };
};

const CardBike = ({ bike }: { bike: Bike }) => {
  const [liked, setLiked] = useState(false);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const navigate = useNavigate();

  // Use real data from database with fallbacks
  const bikeData = {
    rating: bike.rating || 0,
    reviewCount: bike.review_count || 0,
    provider: bike.dealer_name || bike.Park?.name || "BikeHub",
    condition: bike.rating && bike.rating >= 4.5 ? "excellent" : bike.rating && bike.rating >= 3.5 ? "good" : "fair",
    features: bike.rating && bike.rating >= 4.5 ? ["Highly Rated", "Recently Serviced"] : ["Recently Serviced"],
    seats: bike.seats || 2,
    fuelType: bike.fuel_type || "gasoline",
    transmission: bike.transmission || "manual",
  };

  return (
    <Flex
      width="100%"
      maxW={{ base: "100%", sm: "380px" }}
      mx="auto"
      bg={"white"}
      direction="column"
      justifyContent="space-between"
      className="border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
      overflow="hidden"
    >
      {/* Image Section */}
      <Box
        className="w-full relative"
        h={{ base: "120px", sm: "180px", md: "200px" }}
        bgImage={bike.image ? bike.image : bikeImage}
        bgPosition={"center"}
        bgRepeat={"no-repeat"}
        bgSize={"cover"}
      >
        <FaHeart
          onClick={() => setLiked(!liked)}
          className={`absolute top-2 right-2 w-5 h-5 cursor-pointer transition-all ${liked
            ? "text-red-500 drop-shadow-lg scale-110"
            : "text-white drop-shadow-md hover:scale-110"
            }`}
        />
        {bikeData.features.includes("New-model") && (
          <Badge
            position="absolute"
            top="2"
            left="2"
            colorScheme="green"
            fontSize="2xs"
            px={1}
            py={0.5}
          >
            New Model
          </Badge>
        )}
      </Box>

      <VStack p={{ base: 2, md: 4 }} spacing={{ base: 1, md: 3 }} align="stretch">
        {/* Bike Name */}
        <Reveal>
          <Heading as="h3" size={{ base: "xs", md: "md" }} fontWeight={600} className="capitalize" noOfLines={1}>
            {bike.model}
          </Heading>
          {bike.code && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              Code: {bike.code}
            </Text>
          )}
        </Reveal>

        {/* Price & Rating */}
        <Reveal>
          <Flex justifyContent="space-between" alignItems="center" gap={2}>
            <Heading as="h4" size={{ base: "sm", md: "md" }} color="teal.600" fontWeight={700}>
              {bike.price.toLocaleString('vi-VN')} VNĐ
              <Text as="span" fontSize={{ base: "xs", md: "sm" }} fontWeight={400} color="gray.600">
                /day
              </Text>
            </Heading>
            <HStack
              spacing={1}
              bg="orange.50"
              px={{ base: 1.5, md: 2 }}
              py={1}
              borderRadius="md"
              flexShrink={0}
            >
              <FaStar color="#F6AD55" size={14} />
              <Text fontWeight={600} fontSize={{ base: "xs", md: "sm" }} color="orange.600">
                {bikeData.rating}
              </Text>
              <Text fontSize="xs" color="gray.500">
                ({bikeData.reviewCount})
              </Text>
            </HStack>
          </Flex>
        </Reveal>

        <Divider />

        {/* Provider */}
        <Reveal>
          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={1}>
            <Text as="span" fontWeight={600}>
              Provided by:{" "}
            </Text>
            {bikeData.provider}
          </Text>
        </Reveal>

        {/* Condition & Features */}
        <Reveal>
          <VStack align="stretch" spacing={1}>
            <HStack spacing={2}>
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight={600} color="gray.700">
                Condition:
              </Text>
              <Badge
                colorScheme={bikeData.condition === "excellent" ? "green" : "blue"}
                fontSize="xs"
                textTransform="capitalize"
              >
                {bikeData.condition}
              </Badge>
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              {bikeData.features.map((feature, idx) => (
                <Badge key={idx} colorScheme="purple" fontSize="xs" variant="subtle">
                  {feature}
                </Badge>
              ))}
            </HStack>
          </VStack>
        </Reveal>

        <Divider />

        {/* Specifications */}
        <Reveal>
          <HStack spacing={{ base: 2, md: 4 }} justifyContent="space-between" fontSize={{ base: "xs", md: "sm" }}>
            <HStack spacing={1}>
              <FaUsers color="#319795" size={14} />
              <Text color="gray.700" fontWeight={500}>
                {bikeData.seats} seats
              </Text>
            </HStack>
            <HStack spacing={1}>
              {bikeData.fuelType === "gas" ? (
                <FaGasPump color="#319795" size={14} />
              ) : (
                <FaBolt color="#319795" size={14} />
              )}
              <Text color="gray.700" fontWeight={500} textTransform="capitalize">
                {bikeData.fuelType}
              </Text>
            </HStack>
          </HStack>
        </Reveal>

        <Reveal>
          <HStack spacing={1} fontSize={{ base: "xs", md: "sm" }}>
            <GiGearStickPattern color="#319795" size={16} />
            <Text color="gray.700" fontWeight={500} textTransform="capitalize">
              {bikeData.transmission}
            </Text>
          </HStack>
        </Reveal>

        {/* View Details Button */}
        <Reveal>
          <Button
            colorScheme="teal"
            size={{ base: "sm", md: "md" }}
            width="full"
            onClick={() => navigate(`/motorcycles/${bike.id}`)}
            mt={{ base: 1, md: 2 }}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            transition="all 0.2s"
          >
            View Details
          </Button>
        </Reveal>
      </VStack>
    </Flex>
  );
};

export default CardBike;
