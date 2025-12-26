import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { FaPhone, FaWhatsapp, FaTelegram } from "react-icons/fa";

const RequestBookingPage: React.FC = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    contactMethod: "phone",
    contactDetails: "",
    pickupLocation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contactDetails || !formData.pickupLocation) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      console.log("Form submitted:", formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Request Sent!",
        description: "We'll get back to you soon with the best options.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: "",
        contactMethod: "phone",
        contactDetails: "",
        pickupLocation: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContactIcon = () => {
    switch (formData.contactMethod) {
      case "whatsapp":
        return <FaWhatsapp />;
      case "telegram":
        return <FaTelegram />;
      default:
        return <FaPhone />;
    }
  };

  const getContactPlaceholder = () => {
    switch (formData.contactMethod) {
      case "whatsapp":
        return "Enter your WhatsApp number";
      case "telegram":
        return "Enter your Telegram username";
      default:
        return "Enter your phone number";
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, teal.50, white)"
      py={{ base: 8, md: 16 }}
    >
      <Container maxW="container.md">
        <VStack spacing={8}>
          {/* Header */}
          <Box textAlign="center">
            <Heading
              as="h1"
              size={{ base: "xl", md: "2xl" }}
              color="teal.700"
              mb={3}
            >
              Motorcycle Booking Request
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="gray.600"
              maxW="2xl"
            >
              Don't want to browse? Just tell us what you need and we'll get
              back to you with the best options.
            </Text>
          </Box>

          {/* Form */}
          <Box
            as="form"
            onSubmit={handleSubmit}
            w="full"
            bg="white"
            p={{ base: 6, md: 8 }}
            borderRadius="xl"
            boxShadow="2xl"
          >
            <VStack spacing={6} align="stretch">
              {/* Name */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Name or Nickname
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  size="lg"
                  borderColor="teal.300"
                  _hover={{ borderColor: "teal.500" }}
                  focusBorderColor="teal.500"
                />
              </FormControl>

              {/* Preferred Contact */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Preferred Contact Method
                </FormLabel>
                <RadioGroup
                  value={formData.contactMethod}
                  onChange={(value) =>
                    setFormData({ ...formData, contactMethod: value })
                  }
                >
                  <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                    <Radio value="phone" colorScheme="teal">
                      <HStack spacing={2}>
                        <FaPhone />
                        <Text>Phone</Text>
                      </HStack>
                    </Radio>
                    <Radio value="whatsapp" colorScheme="teal">
                      <HStack spacing={2}>
                        <FaWhatsapp />
                        <Text>WhatsApp</Text>
                      </HStack>
                    </Radio>
                    <Radio value="telegram" colorScheme="teal">
                      <HStack spacing={2}>
                        <FaTelegram />
                        <Text>Telegram</Text>
                      </HStack>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Contact Details */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Your Contact Details
                </FormLabel>
                <InputGroup size="lg">
                  <InputLeftAddon bg="teal.50" color="teal.600">
                    {getContactIcon()}
                  </InputLeftAddon>
                  <Input
                    type="text"
                    placeholder={getContactPlaceholder()}
                    value={formData.contactDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactDetails: e.target.value,
                      })
                    }
                    borderColor="teal.300"
                    _hover={{ borderColor: "teal.500" }}
                    focusBorderColor="teal.500"
                  />
                </InputGroup>
              </FormControl>

              {/* Pickup Location */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Where do you want to pick it up?
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Enter pickup location"
                  value={formData.pickupLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupLocation: e.target.value,
                    })
                  }
                  size="lg"
                  borderColor="teal.300"
                  _hover={{ borderColor: "teal.500" }}
                  focusBorderColor="teal.500"
                />
              </FormControl>

              {/* Submit Button */}
              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                fontSize="md"
                fontWeight="bold"
                isLoading={isSubmitting}
                loadingText="Sending..."
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                transition="all 0.2s"
                mt={4}
              >
                Send Request
              </Button>
            </VStack>
          </Box>

          {/* Additional Info */}
          <Box
            bg="teal.50"
            p={4}
            borderRadius="lg"
            w="full"
            textAlign="center"
          >
            <Text color="teal.700" fontSize="sm">
              💡 We typically respond within 24 hours with personalized
              motorcycle recommendations based on your needs.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default RequestBookingPage;