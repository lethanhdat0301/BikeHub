import React, { useState, useEffect } from "react";
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
  Badge,
  FormHelperText,
  Checkbox,
  Link,
} from "@chakra-ui/react";
import { FaPhone, FaWhatsapp, FaTelegram, FaCheckCircle, FaEnvelope } from "react-icons/fa";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import bookingRequestService from "../../services/bookingRequestService";

const RequestBookingPage: React.FC = () => {
  const toast = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactMethod: "phone",
    contactDetails: "",
    pickupLocation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Auto-fill name if user is logged in
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          contactDetails: user.phone || "",
        }));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.contactDetails || !formData.pickupLocation) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please read and agree to the Terms & Conditions and Rental Guidelines",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    // // Execute reCAPTCHA v3
    // if (!executeRecaptcha) {
    //   console.log('Execute recaptcha not yet available');
    //   toast({
    //     title: "reCAPTCHA Error",
    //     description: "reCAPTCHA verification is not ready. Please try again.",
    //     status: "error",
    //     duration: 3000,
    //     isClosable: true,
    //   });
    //   setIsSubmitting(false);
    //   return;
    // }

    // let recaptchaToken: string;
    // try {
    //   recaptchaToken = await executeRecaptcha('booking_request');
    // } catch (error) {
    //   console.error('reCAPTCHA error:', error);
    //   toast({
    //     title: "reCAPTCHA Error",
    //     description: "Failed to verify reCAPTCHA. Please try again.",
    //     status: "error",
    //     duration: 3000,
    //     isClosable: true,
    //   });
    //   setIsSubmitting(false);
    //   return;
    // }

    try {
      // Get user_id if logged in
      const userString = localStorage.getItem("user");
      let userId = undefined;
      if (userString) {
        try {
          const user = JSON.parse(userString);
          userId = user.id;
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      console.log("Gửi booking request đến admin...");

      // Call API to create booking request
      const response = await bookingRequestService.createBookingRequest({
        user_id: userId,
        name: formData.name,
        email: formData.email,
        contact_method: formData.contactMethod,
        contact_details: formData.contactDetails,
        pickup_location: formData.pickupLocation,
      });

      console.log("Booking request đã được tạo:", response);

      setRequestSent(true);

      toast({
        title: "Request Sent Successfully! 🎉",
        description: `Booking ID: ${response.data?.bookingId || response.bookingId || 'BK' + String(response.data?.id || response.id).padStart(6, '0')}. Your booking request has been sent to admin. We'll contact you soon!`,
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top",
      });

      // Reset form (but keep name and email if logged in)
      setFormData(prev => ({
        name: userId ? prev.name : "",
        email: userId ? prev.email : "",
        contactMethod: "phone",
        contactDetails: userId ? prev.contactDetails : "",
        pickupLocation: "",
      }));

      // Reset terms agreement
      setAgreedToTerms(false);

      // Reset requestSent after 5 seconds
      setTimeout(() => setRequestSent(false), 5000);
    } catch (error: any) {
      console.log("🔥 LỖI CHI TIẾT TỪ SERVER:", error.response?.data);

      console.error("❌ Error submitting booking request:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        status: "error",
        duration: 5000,
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
      py={{ base: 4, md: 16 }}
      px={{ base: 4, md: 0 }}
      overflowX="hidden"
    >
      <Container maxW="container.md" px={{ base: 0, md: 4 }}>
        <VStack spacing={{ base: 4, md: 8 }}>
          {/* Header */}
          <Box textAlign="center" px={{ base: 2, md: 0 }}>
            <Heading
              as="h1"
              size={{ base: "lg", md: "2xl" }}
              color="teal.700"
              mb={3}
            >
              Motorcycle Booking Request
            </Heading>
            <Text
              fontSize={{ base: "sm", md: "lg" }}
              color="gray.600"
              maxW="2xl"
              px={{ base: 2, md: 0 }}
            >
              Don't want to browse? Just tell us what you need and we'll get
              back to you with the best options.
            </Text>
            {requestSent && (
              <Badge
                colorScheme="green"
                fontSize={{ base: "xs", md: "md" }}
                p={{ base: 1, md: 2 }}
                mt={4}
                borderRadius="md"
              >
                <HStack spacing={2} flexWrap="wrap" justifyContent="center">
                  <FaCheckCircle />
                  <Text fontSize={{ base: "xs", md: "sm" }}>Request sent to admin successfully!</Text>
                </HStack>
              </Badge>
            )}
          </Box>

          {/* Form */}
          <Box
            as="form"
            onSubmit={handleSubmit}
            w="full"
            bg="white"
            p={{ base: 4, md: 8 }}
            borderRadius="xl"
            boxShadow="2xl"
          >
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              {/* Name */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  Name or Nickname
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  size={{ base: "md", md: "lg" }}
                  borderColor="teal.300"
                  _hover={{ borderColor: "teal.500" }}
                  focusBorderColor="teal.500"
                />
              </FormControl>

              {/* Email for Notifications */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  Email (For Notifications)
                </FormLabel>
                <InputGroup size={{ base: "md", md: "lg" }}>
                  <InputLeftAddon bg="teal.50" color="teal.600">
                    <FaEnvelope />
                  </InputLeftAddon>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    borderColor="teal.300"
                    _hover={{ borderColor: "teal.500" }}
                    focusBorderColor="teal.500"
                  />
                </InputGroup>
                <FormHelperText fontSize="xs" color="gray.500">
                  We'll send booking confirmations and updates to this email
                </FormHelperText>
              </FormControl>

              {/* Preferred Contact */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  Preferred Contact Method
                </FormLabel>
                <RadioGroup
                  value={formData.contactMethod}
                  onChange={(value) =>
                    setFormData({ ...formData, contactMethod: value })
                  }
                >
                  <Stack direction={{ base: "column", sm: "row" }} spacing={{ base: 2, sm: 4 }}>
                    <Radio value="phone" colorScheme="teal" size={{ base: "sm", md: "md" }}>
                      <HStack spacing={2}>
                        <FaPhone size={14} />
                        <Text fontSize={{ base: "sm", md: "md" }}>Phone</Text>
                      </HStack>
                    </Radio>
                    <Radio value="whatsapp" colorScheme="teal" size={{ base: "sm", md: "md" }}>
                      <HStack spacing={2}>
                        <FaWhatsapp size={14} />
                        <Text fontSize={{ base: "sm", md: "md" }}>WhatsApp</Text>
                      </HStack>
                    </Radio>
                    <Radio value="telegram" colorScheme="teal" size={{ base: "sm", md: "md" }}>
                      <HStack spacing={2}>
                        <FaTelegram size={14} />
                        <Text fontSize={{ base: "sm", md: "md" }}>Telegram</Text>
                      </HStack>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Contact Details */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  Your Contact Details
                </FormLabel>
                <InputGroup size={{ base: "md", md: "lg" }}>
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
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  Pickup Location
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Enter your preferred pickup location (e.g., Downtown, Beach Area, etc.)"
                  value={formData.pickupLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupLocation: e.target.value,
                    })
                  }
                  size={{ base: "md", md: "lg" }}
                  borderColor="teal.300"
                  _hover={{ borderColor: "teal.500" }}
                  focusBorderColor="teal.500"
                />
                <FormHelperText fontSize="xs" color="gray.500">
                  Please specify where you'd like to pick up the motorcycle
                </FormHelperText>
              </FormControl>

              {/* Terms and Conditions Agreement */}
              <FormControl isRequired>
                <Checkbox
                  colorScheme="teal"
                  isChecked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  size={{ base: "sm", md: "md" }}
                >
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.700">
                    I have read and agree to the{" "}
                    <Link
                      href="/terms"
                      color="teal.600"
                      fontWeight="semibold"
                      isExternal
                      _hover={{ textDecoration: "underline" }}
                    >
                      Terms & Conditions
                    </Link>
                    {" "}and{" "}
                    <Link
                      href="/rental-guide"
                      color="teal.600"
                      fontWeight="semibold"
                      isExternal
                      _hover={{ textDecoration: "underline" }}
                    >
                      Rental Guidelines
                    </Link>
                  </Text>
                </Checkbox>
                <FormHelperText fontSize="xs" color="gray.500" ml={6}>
                  Required before submitting your booking request
                </FormHelperText>
              </FormControl>

              {/* Submit Button */}
              {/* reCAPTCHA v3 runs automatically in the background */}
              <Button
                type="submit"
                colorScheme="teal"
                size={{ base: "md", md: "lg" }}
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="bold"
                isLoading={isSubmitting}
                loadingText="Sending..."
                isDisabled={!agreedToTerms}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                transition="all 0.2s"
                mt={{ base: 2, md: 4 }}
                w="full"
              >
                Send Request
              </Button>
            </VStack>
          </Box>

          {/* Additional Info */}
          <Box
            bg="teal.50"
            p={{ base: 3, md: 4 }}
            borderRadius="lg"
            w="full"
            textAlign="center"
          >
            <Text color="teal.700" fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 0 }}>
              💡 Your request will be sent to our admin team. We typically respond within 24 hours with personalized
              motorcycle recommendations based on your needs.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default RequestBookingPage;