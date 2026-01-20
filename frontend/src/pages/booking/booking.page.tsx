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
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const RequestBookingPage: React.FC = () => {
  const toast = useToast();
  const { t } = useTranslation();

  // Debug: verify i18n language and key availability using the initialized i18n instance
  try {
    const currentLang = i18n.language;
    const resources = Object.keys(i18n.options?.resources || {});
    const hasKeyCurrent = i18n.exists?.('booking.pageTitle', { lng: currentLang });
    const hasKeyEn = i18n.exists?.('booking.pageTitle', { lng: 'en' });
    // eslint-disable-next-line no-console
    console.log('[i18n-debug] booking.page', {
      language: currentLang,
      resources,
      supportedLngs: i18n.options?.supportedLngs,
      languages: i18n.languages,
      hasKeyCurrent,
      hasKeyEn,
      enValue: (i18n.getDataByLanguage('en') as any)?.translation?.booking?.pageTitle,
      tResult: t('booking.pageTitle'),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[i18n-debug] could not inspect i18n', err);
  }
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

  // Save form data to sessionStorage (cleared when tab closes)
  const saveFormData = (data: typeof formData) => {
    sessionStorage.setItem('bookingFormData', JSON.stringify(data));
  };

  // Restore from sessionStorage on mount (if user refreshed during typing)
  useEffect(() => {
    const savedData = sessionStorage.getItem('bookingFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    if (formData.name || formData.email || formData.contactDetails || formData.pickupLocation) {
      saveFormData(formData);
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.contactDetails || !formData.pickupLocation) {
      toast({
        title: t('booking.errors.requiredFieldsTitle'),
        description: t('booking.errors.requiredFieldsDescription'),
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
        title: t('booking.errors.invalidEmailTitle'),
        description: t('booking.errors.invalidEmailDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      toast({
        title: t('booking.errors.termsRequiredTitle'),
        description: t('booking.errors.termsRequiredDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    // Execute reCAPTCHA v3
    if (!executeRecaptcha) {
      // console.log('Execute recaptcha not yet available');
      toast({
        title: t('booking.errors.recaptchaTitle'),
        description: t('booking.errors.recaptchaDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

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

      // console.log("Gửi booking request đến admin...");

      // Call API to create booking request
      const response = await bookingRequestService.createBookingRequest({
        user_id: userId,
        name: formData.name,
        email: formData.email,
        contact_method: formData.contactMethod,
        contact_details: formData.contactDetails,
        pickup_location: formData.pickupLocation,
      });

      // console.log("Booking request đã được tạo:", response);

      setRequestSent(true);

      const respAny: any = response as any;
      const bookingIdStr = respAny?.data?.bookingId || respAny?.bookingId || 'BK' + String(respAny?.data?.id || respAny?.id).padStart(6, '0');
      toast({
        title: t('booking.successTitle'),
        description: t('booking.successDescription', { bookingId: bookingIdStr }),
        status: "success",
        // duration: 10000,
        duration: null,
        isClosable: true,
        position: "top",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        contactMethod: "phone",
        contactDetails: "",
        pickupLocation: "",
      });
      setAgreedToTerms(false);
      sessionStorage.removeItem('bookingFormData');

      // Reset requestSent after 5 seconds
      setTimeout(() => setRequestSent(false), 5000);
    } catch (error: any) {
      // console.log("🔥 LỖI CHI TIẾT TỪ SERVER:", error.response?.data);

      console.error("❌ Error submitting booking request:", error);
      toast({
        title: t('booking.errors.errorTitle'),
        description: error.response?.data?.message || t('booking.errors.errorDescription'),
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
        return t('booking.contact.placeholder.whatsapp');
      case "telegram":
        return t('booking.contact.placeholder.telegram');
      default:
        return t('booking.contact.placeholder.phone');
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
              {t('booking.pageTitle')}
            </Heading>
            <Text
              fontSize={{ base: "sm", md: "lg" }}
              color="gray.600"
              maxW="2xl"
              px={{ base: 2, md: 0 }}
            >
              {t('booking.pageDescription')}
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
                  <Text fontSize={{ base: "xs", md: "sm" }}>{t('booking.requestSuccess')}</Text>
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
                  {t('booking.form.nameLabel')}
                </FormLabel>
                <Input
                  type="text"
                  placeholder={t('booking.form.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => {
                    const newFormData = { ...formData, name: e.target.value };
                    setFormData(newFormData);
                  }}
                  size={{ base: "md", md: "lg" }}
                  borderColor="teal.300"
                  _hover={{ borderColor: "teal.500" }}
                  focusBorderColor="teal.500"
                />
              </FormControl>

              {/* Email for Notifications */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  {t('booking.form.emailLabel')}
                </FormLabel>
                <InputGroup size={{ base: "md", md: "lg" }}>
                  <InputLeftAddon bg="teal.50" color="teal.600">
                    <FaEnvelope />
                  </InputLeftAddon>
                  <Input
                    type="email"
                    placeholder={t('booking.form.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => {
                      const newFormData = { ...formData, email: e.target.value };
                      setFormData(newFormData);
                    }}
                    borderColor="teal.300"
                    _hover={{ borderColor: "teal.500" }}
                    focusBorderColor="teal.500"
                  />
                </InputGroup>
                <FormHelperText fontSize="xs" color="gray.500">
                  {t('booking.form.emailHint')}
                </FormHelperText>
              </FormControl>

              {/* Preferred Contact */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  {t('booking.form.contactMethodLabel')}
                </FormLabel>
                <RadioGroup
                  value={formData.contactMethod}
                  onChange={(value) => {
                    const newFormData = { ...formData, contactMethod: value };
                    setFormData(newFormData);
                  }}
                >
                  <Stack direction={{ base: "column", sm: "row" }} spacing={{ base: 2, sm: 4 }}>
                    <Radio value="phone" colorScheme="teal" size={{ base: "sm", md: "md" }}>
                      <HStack spacing={2}>
                        <FaPhone size={14} />
                        <Text fontSize={{ base: "sm", md: "md" }}>{t('booking.contact.phone')}</Text>
                      </HStack>
                    </Radio>
                    <Radio value="whatsapp" colorScheme="teal" size={{ base: "sm", md: "md" }}>
                      <HStack spacing={2}>
                        <FaWhatsapp size={14} />
                        <Text fontSize={{ base: "sm", md: "md" }}>{t('booking.contact.whatsapp')}</Text>
                      </HStack>
                    </Radio>
                    <Radio value="telegram" colorScheme="teal" size={{ base: "sm", md: "md" }}>
                      <HStack spacing={2}>
                        <FaTelegram size={14} />
                        <Text fontSize={{ base: "sm", md: "md" }}>{t('booking.contact.telegram')}</Text>
                      </HStack>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Contact Details */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  {t('booking.yourContactDetails')}
                </FormLabel>
                <InputGroup size={{ base: "md", md: "lg" }}>
                  <InputLeftAddon bg="teal.50" color="teal.600">
                    {getContactIcon()}
                  </InputLeftAddon>
                  <Input
                    type="text"
                    placeholder={getContactPlaceholder()}
                    value={formData.contactDetails}
                    onChange={(e) => {
                      const newFormData = {
                        ...formData,
                        contactDetails: e.target.value,
                      };
                      setFormData(newFormData);
                    }}
                    borderColor="teal.300"
                    _hover={{ borderColor: "teal.500" }}
                    focusBorderColor="teal.500"
                  />
                </InputGroup>
              </FormControl>

              {/* Pickup Location */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                  {t('booking.form.pickupLabel')}
                </FormLabel>
                <Input
                  type="text"
                  placeholder={t('booking.form.pickupPlaceholder')}
                  value={formData.pickupLocation}
                  onChange={(e) => {
                    const newFormData = {
                      ...formData,
                      pickupLocation: e.target.value,
                    };
                    setFormData(newFormData);
                  }}
                  size={{ base: "md", md: "lg" }}
                  borderColor="teal.300"
                  _hover={{ borderColor: "teal.500" }}
                  focusBorderColor="teal.500"
                />
                <FormHelperText fontSize="xs" color="gray.500">
                  {t('booking.form.pickupHelper')}
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
                    {t('booking.agreeText1')}{" "}
                    <Link
                      href="/terms"
                      color="teal.600"
                      fontWeight="semibold"
                      isExternal
                      _hover={{ textDecoration: "underline" }}
                    >
                      {t('booking.termsLink')}
                    </Link>
                    {" "}{t('booking.agreeText2')}{" "}
                    <Link
                      href="/rental-guide"
                      color="teal.600"
                      fontWeight="semibold"
                      isExternal
                      _hover={{ textDecoration: "underline" }}
                    >
                      {t('booking.rentalGuideLink')}
                    </Link>
                  </Text>
                </Checkbox>
                <FormHelperText fontSize="xs" color="gray.500" ml={6}>
                  {t('booking.termsRequiredDescription')}
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
                loadingText={t('booking.sending')}
                isDisabled={!agreedToTerms}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                transition="all 0.2s"
                mt={{ base: 2, md: 4 }}
                w="full"
              >
                {t('booking.submit')}
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
              {t('booking.addlInfo')}
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default RequestBookingPage;