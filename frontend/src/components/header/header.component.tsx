import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon, CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FaGlobeAsia, FaInstagram, FaPhone, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import logoImage from "../../assets/images/logoofficial.png";

type HeaderItem = {
  key: string;
  path: string;
  isHash?: boolean;
};

const headerItems: HeaderItem[] = [
  { key: "search", path: "search" },
  { key: "bookingRequest", path: "request-booking" },
  { key: "return", path: "return" },
  { key: "trackOrder", path: "tracking" },
  { key: "howItWorks", path: "howItWork", isHash: true },
];

const phoneNumbers = [{ number: "+84 388 817 935", display: "0388817935" }];

const socialLinks = {
  telegram: "https://t.me/RentNrideVN",
  whatsapp: "https://wa.me/84388817935",
  instagram: "https://www.instagram.com/rentnride.travel/",
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [language, setLanguage] = useState<string>(localStorage.getItem("i18nextLng") || "en");

  const changeLanguageTo = (lng: string) => {
    setLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  };

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [i18n, language]);

  const handleNavigation = (item: HeaderItem) => {
    if (item.isHash) {
      if (location.pathname === "/") {
        const element = document.getElementById("howItWork");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      navigate("/");
      window.setTimeout(() => {
        const element = document.getElementById("howItWork");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return;
    }

    navigate(`/${item.path}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 px-3 py-2 text-gray-700 shadow-sm backdrop-blur sm:px-5 lg:px-8">
      <Box className="mx-auto flex w-full max-w-screen-2xl items-center gap-3">
        <Link to="/" style={{ flexShrink: 0 }}>
          <img src={logoImage} alt="Rent N Ride" className="h-11 w-auto sm:h-12 lg:h-14" />
        </Link>

        <HStack
          as="nav"
          spacing={{ md: "4", lg: "7" }}
          display={{ base: "none", md: "flex" }}
          flex="1"
          minW={0}
          overflowX="auto"
          css={{
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          <Link to="/">
            <Button
              paddingStart={0}
              paddingEnd={0}
              className="group hover:text-teal-500 focus:text-teal-500"
              variant="nav"
              _hover={{ transition: "all 0.3s ease-in-out" }}
              pos="relative"
              fontSize={{ md: "sm", lg: "md" }}
              whiteSpace="nowrap"
            >
              {t("header.home")}
              <Box
                position="absolute"
                className="bottom-0 left-0 h-[2px] w-0 rounded-xl bg-teal-500"
                _groupFocus={{ width: "100%" }}
                _groupHover={{ width: "100%", transition: "all 0.3s ease-in-out" }}
              />
            </Button>
          </Link>

          {headerItems.map((item) => (
            <Button
              key={item.key}
              paddingStart={0}
              paddingEnd={0}
              className="group hover:text-teal-500 focus:text-teal-500"
              variant="nav"
              _hover={{ transition: "all 0.3s ease-in-out" }}
              pos="relative"
              onClick={() => handleNavigation(item)}
              fontSize={{ md: "sm", lg: "md" }}
              whiteSpace="nowrap"
            >
              {t(`header.${item.key}`)}
              <Box
                position="absolute"
                className="bottom-0 left-0 h-[2px] w-0 rounded-xl bg-teal-500"
                _groupFocus={{ width: "100%" }}
                _groupHover={{ width: "100%", transition: "all 0.3s ease-in-out" }}
              />
            </Button>
          ))}
        </HStack>

        <HStack spacing={2} display={{ base: "none", lg: "flex" }} flexShrink={0}>
          <IconButton
            as="a"
            href={socialLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            icon={<FaTelegram />}
            size="sm"
            variant="outline"
            colorScheme="telegram"
            color="#0088CC"
            borderColor="#0088CC"
            _hover={{ bg: "blue.50", transform: "scale(1.1)" }}
            transition="all 0.2s"
          />
          <IconButton
            as="a"
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            icon={<FaWhatsapp />}
            size="sm"
            variant="outline"
            colorScheme="whatsapp"
            color="#25D366"
            borderColor="#25D366"
            _hover={{ bg: "green.50", transform: "scale(1.1)" }}
            transition="all 0.2s"
          />
          <IconButton
            as="a"
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            icon={<FaInstagram />}
            size="sm"
            variant="outline"
            colorScheme="pink"
            color="#E4405F"
            borderColor="#E4405F"
            _hover={{ bg: "pink.50", transform: "scale(1.1)" }}
            transition="all 0.2s"
          />
        </HStack>

        <VStack spacing={1} display={{ base: "none", xl: "flex" }} align="flex-start" flexShrink={0}>
          {phoneNumbers.map((phone) => (
            <HStack key={phone.number} spacing={1}>
              <FaPhone size={12} color="#319795" />
              <Text fontSize="xs" fontWeight="medium" color="teal.600">
                <a href={`tel:${phone.number}`}>{phone.display}</a>
              </Text>
            </HStack>
          ))}
        </VStack>

        <Select
          value={language}
          onChange={(e) => changeLanguageTo(e.target.value)}
          size="sm"
          width="90px"
          display={{ base: "none", lg: "block" }}
          borderColor="teal.300"
          _hover={{ borderColor: "teal.500" }}
          focusBorderColor="teal.500"
          flexShrink={0}
        >
          <option value="en">EN</option>
          <option value="ru">RU</option>
          <option value="vi">VI</option>
          <option value="de">DE</option>
        </Select>

        <HStack spacing={2} display={{ base: "flex", md: "none" }} marginLeft="auto" flexShrink={0}>
          <IconButton
            as="a"
            href={`tel:${phoneNumbers[0].number}`}
            aria-label="Call hotline"
            icon={<FaPhone size={16} />}
            size="sm"
            rounded="full"
            colorScheme="teal"
            variant="outline"
            borderWidth="1.5px"
          />
          <IconButton
            size="sm"
            aria-label="Toggle navigation"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            onClick={isOpen ? onClose : onOpen}
            display={{ base: "inline-flex", md: "none" }}
          />
        </HStack>
      </Box>

      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay backdropFilter="blur(5px)" />
        <DrawerContent bg="white">
          <DrawerCloseButton size="lg" mt={2} />
          <DrawerBody display="flex" flexDirection="column" h="100%" px={5} py={6}>
            <VStack align="stretch" spacing={6} h="100%">
              <HStack justify="space-between" pr={10}>
                <img src={logoImage} alt="Rent N Ride" className="h-10 w-auto" />
                <Button
                  as="a"
                  href={`tel:${phoneNumbers[0].number}`}
                  leftIcon={<FaPhone size={14} />}
                  size="sm"
                  rounded="full"
                  colorScheme="teal"
                  variant="solid"
                >
                  {phoneNumbers[0].display}
                </Button>
              </HStack>

              <VStack as="nav" spacing={3} align="stretch">
                <Link to="/" onClick={onClose}>
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    fontSize="md"
                    fontWeight="semibold"
                    color="gray.700"
                    px={3}
                    py={6}
                    rounded="xl"
                    _hover={{ color: "teal.600", bg: "teal.50" }}
                    w="full"
                  >
                    {t("header.home")}
                  </Button>
                </Link>

                {headerItems.map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    justifyContent="flex-start"
                    fontSize="md"
                    fontWeight="medium"
                    color="gray.700"
                    px={3}
                    py={6}
                    rounded="xl"
                    _hover={{ color: "teal.600", bg: "teal.50" }}
                    onClick={() => {
                      handleNavigation(item);
                      onClose();
                    }}
                    w="full"
                  >
                    {t(`header.${item.key}`)}
                  </Button>
                ))}
              </VStack>

              <Divider my={1} borderColor="gray.100" />

              <VStack spacing={4} align="stretch">
                <Menu autoSelect={false}>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    leftIcon={<FaGlobeAsia />}
                    variant="outline"
                    size="md"
                    justifyContent="space-between"
                    borderColor="teal.200"
                    color="teal.600"
                    rounded="xl"
                    fontWeight="medium"
                    _hover={{ bg: "teal.50", borderColor: "teal.500" }}
                    _active={{ bg: "teal.100" }}
                  >
                    {t(`lang.${language}`)}
                  </MenuButton>
                  <MenuList minW="160px" fontSize="sm" zIndex={1500}>
                    <MenuItem onClick={() => changeLanguageTo("en")}>🇺🇸 {t("lang.en")}</MenuItem>
                    <MenuItem onClick={() => changeLanguageTo("ru")}>🇷🇺 {t("lang.ru")}</MenuItem>
                    <MenuItem onClick={() => changeLanguageTo("vi")}>🇻🇳 {t("lang.vi")}</MenuItem>
                    <MenuItem onClick={() => changeLanguageTo("de")}>🇩🇪 {t("lang.de")}</MenuItem>
                  </MenuList>
                </Menu>

                <HStack spacing={3} justify="space-between">
                  <IconButton
                    as="a"
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram"
                    icon={<FaTelegram size={20} />}
                    variant="outline"
                    color="#0088CC"
                    rounded="xl"
                    borderColor="#0088CC"
                    flex="1"
                    _hover={{ color: "#0088CC", borderColor: "#0088CC", bg: "blue.50" }}
                  />
                  <IconButton
                    as="a"
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    icon={<FaWhatsapp size={20} />}
                    variant="outline"
                    color="#25D366"
                    rounded="xl"
                    borderColor="#25D366"
                    flex="1"
                    _hover={{ color: "#25D366", borderColor: "#25D366", bg: "green.50" }}
                  />
                  <IconButton
                    as="a"
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    icon={<FaInstagram size={20} />}
                    variant="outline"
                    color="#E4405F"
                    rounded="xl"
                    borderColor="#E4405F"
                    flex="1"
                    _hover={{ color: "#E4405F", borderColor: "#E4405F", bg: "pink.50" }}
                  />
                </HStack>

                <VStack spacing={2} align="stretch">
                  {phoneNumbers.map((phone) => (
                    <Button
                      key={phone.number}
                      as="a"
                      href={`tel:${phone.number}`}
                      leftIcon={<FaPhone size={12} />}
                      justifyContent="flex-start"
                      variant="ghost"
                      rounded="xl"
                      color="teal.600"
                      fontWeight="medium"
                      fontSize="sm"
                      _hover={{ bg: "teal.50", color: "teal.700" }}
                    >
                      {phone.display}
                    </Button>
                  ))}
                </VStack>
              </VStack>

              <Box flex="1" />

              <Text fontSize="xs" color="gray.400" textAlign="center">
                Rent N Ride
              </Text>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </header>
  );
};

export default Header;
