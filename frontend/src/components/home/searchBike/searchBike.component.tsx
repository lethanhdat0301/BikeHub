import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const SearchBike: React.FC = () => {
    const [location, setLocation] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const navigate = useNavigate();

    const bgGradient = useColorModeValue(
        "linear(to-r, teal.400, teal.600)",
        "linear(to-r, teal.600, teal.800)"
    );

    const handleSearch = () => {
        if (!location) {
            alert("Please select a location");
            return;
        }

        // TODO: Implement search logic
        console.log("Searching for bikes:", { location, startDate, endDate });

        // Navigate to search results or filter bikes
        // You can use navigate from react-router-dom
        const params = new URLSearchParams();
        if (location) params.append("location", location);
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
                                        Location
                                    </FormLabel>
                                    <Select
                                        placeholder="Select location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        size="lg"
                                        borderColor="teal.300"
                                        _hover={{ borderColor: "teal.500" }}
                                        focusBorderColor="teal.500"
                                    >
                                        <option value="phu-quoc">Phu Quoc</option>
                                        <option value="nha-trang">Nha Trang</option>
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
