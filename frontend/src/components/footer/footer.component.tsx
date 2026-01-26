import { Box, Button, Grid, SimpleGrid, Image, Link as A, VStack, Heading, HStack, Text, IconButton } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FaFacebookF, FaInstagram, FaTelegram, FaPhone, FaEnvelope } from 'react-icons/fa';
import logoImage from "../../assets/images/logoofficial.png";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const companyLinks = [
    { key: "home", path: "/", labelKey: "footer.home" },
    { key: "howItWorks", path: "howItWork", isHash: true, labelKey: "footer.howItWorks" }
  ];

  const supportLinks = [
    { key: "termsOfService", path: "terms", labelKey: "footer.termsOfService" }
  ];

  const exploreLinks = [
    { key: "search", path: "search", labelKey: "footer.search" },
    { key: "bookingRequest", path: "request-booking", labelKey: "footer.bookingRequest" },
    { key: "trackOrder", path: "tracking", labelKey: "footer.trackOrder" },
    { key: "return", path: "return", labelKey: "footer.return" }
  ];

  const handleNavigation = (item: any) => {
    if (item.isHash) {
      // If on home page, just scroll
      if (location.pathname === '/') {
        const element = document.getElementById('howItWork');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // If not on home page, navigate to home then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById('howItWork');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } else {
      navigate('/' + item.path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 8, md: 10 }} mb={8}>
          {/* Logo & Tagline */}
          <VStack align={{ base: "center", md: "start" }} spacing={4}>
            <Link to="/">
              <Image src={logoImage} width="140px" alt="RentNRide Logo" />
            </Link>
            <Text fontSize="sm" color="gray.600" textAlign={{ base: "center", md: "left" }}>
              {t('home.heroTagline') || 'Your Next Ride, Just a Click Away'}
            </Text>
            <HStack spacing={3} pt={2}>
              <IconButton
                as="a"
                href="https://www.facebook.com/share/1C9eBPouDu/"
                target="_blank"
                aria-label="Facebook"
                icon={<FaFacebookF />}
                size="sm"
                variant="ghost"
                colorScheme="facebook"
                rounded="full"
              />
              <IconButton
                as="a"
                href="https://www.instagram.com/rentnride.travel/"
                target="_blank"
                aria-label="Instagram"
                icon={<FaInstagram />}
                size="sm"
                variant="ghost"
                colorScheme="pink"
                rounded="full"
              />
              <IconButton
                as="a"
                href="https://t.me/rentnride"
                target="_blank"
                aria-label="Telegram"
                icon={<FaTelegram />}
                size="sm"
                variant="ghost"
                colorScheme="telegram"
                rounded="full"
              />
            </HStack>
          </VStack>

          {/* Company Links */}
          <VStack align={{ base: "center", md: "start" }} spacing={3}>
            <Heading size="sm" color="gray.700" mb={1} display={{ base: "none", md: "block" }}>
              Company
            </Heading>
            {companyLinks.map((item, i) => (
              <Link
                key={i}
                to={item.isHash ? "/" : item.path}
                onClick={(e) => {
                  if (item.isHash) {
                    e.preventDefault();
                    handleNavigation(item);
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                style={{ textDecoration: 'none' }}
              >
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ color: "teal.500", textDecoration: "underline" }}
                  cursor="pointer"
                >
                  {t(item.labelKey)}
                </Text>
              </Link>
            ))}
          </VStack>

          {/* Support Links */}
          <VStack align={{ base: "center", md: "start" }} spacing={3}>
            <Heading size="sm" color="gray.700" mb={1} display={{ base: "none", md: "block" }}>
              Support
            </Heading>
            {supportLinks.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ textDecoration: 'none' }}
              >
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ color: "teal.500", textDecoration: "underline" }}
                  cursor="pointer"
                >
                  {t(item.labelKey)}
                </Text>
              </Link>
            ))}
          </VStack>

          {/* Explore Links */}
          <VStack align={{ base: "center", md: "start" }} spacing={3}>
            <Heading size="sm" color="gray.700" mb={1} display={{ base: "none", md: "block" }}>
              Explore
            </Heading>
            {exploreLinks.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ textDecoration: 'none' }}
              >
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ color: "teal.500", textDecoration: "underline" }}
                  cursor="pointer"
                >
                  {t(item.labelKey)}
                </Text>
              </Link>
            ))}
          </VStack>
        </SimpleGrid>

        {/* Bottom Bar */}
        <Box borderTop="1px" borderColor="gray.200" pt={6} mt={6}>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            © 2026{" "}
            <Link to="/" className="hover:underline text-teal-600">
              {t('footer.companyName') || 'RentNRide'}
            </Link>
            . {t('footer.allRightsReserved') || 'All rights reserved'}.
            {" "}
            <Link to="/terms" className="hover:underline text-teal-600">
              {t('footer.termsLink') || 'Terms of Service'}
            </Link>
          </Text>
        </Box>
      </Box>
    </footer>
  );
};

export default Footer;
