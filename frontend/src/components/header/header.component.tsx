import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  HStack,
  Flex,
  Menu,
  Link as A,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  Center,
  MenuDivider,
  Box,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  useDisclosure,
  VStack,
  Select,
  // DrawerHeader,
  DrawerCloseButton,
  // useColorMode,
  Divider,
} from "@chakra-ui/react";
import { TbLogout } from "react-icons/tb";
import { FaTelegram, FaWhatsapp, FaFacebookMessenger, FaPhone, FaGlobeAsia } from "react-icons/fa";
import LogoutButton from "../logoutButton.component";
import { useAuth } from "../../hooks/useAuth";
import logoImage from "../../assets/images/logoofficial.png";
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
/**
 * Header: A functional component representing a header in React with Tailwind CSS.
 *
 * @returns {JSX.Element} - The JSX element representing the header.
 */
const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>(localStorage.getItem('i18nextLng') || 'en');
  const { t, i18n } = useTranslation();

  const changeLanguageTo = (lng: string) => {
    setLanguage(lng);
    if (i18n) {
      i18n.changeLanguage(lng);
      console.log('[i18n] changeLanguageTo:', lng, 'current:', i18n.language, 'available:', Object.keys(i18n.options?.resources || {}));
    } else {
      console.log('[i18n] no i18n instance to change language to', lng);
    }
    localStorage.setItem('i18nextLng', lng);
  };

  // Ensure i18n uses stored language on mount / when language changes
  React.useEffect(() => {
    if (i18n && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [i18n, language]);


  const headerItems = [
    { key: "search", path: "search" },
    { key: "bookingRequest", path: "request-booking" },
    { key: "return", path: "return" },
    { key: "trackOrder", path: "tracking" },
    { key: "howItWorks", path: "howItWork", isHash: true }
  ];

  const phoneNumbers = [
    { number: "+84 123 456 789", display: "0123 456 789" },
    { number: "+84 123 456 789", display: "0123 456 789" }
  ];

  const socialLinks = {
    telegram: "https://t.me/yourusername", // Thay bằng Telegram username
    whatsapp: "https://wa.me/84123456789", // Thay bằng số điện thoại (84XXXXXXXXX)
    messenger: "https://m.me/yourpageid"    // Thay bằng Facebook Page ID
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    // TODO: Implement language change logic
    // console.log('Language changed to:', e.target.value);
  };

  const location = useLocation();
  // const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    }
  };

  return (
    <header className="flex justify-between items-center text-gray-700 py-2 px-4 sm:px-12 shadow-lg" style={{ maxWidth: '100vw', width: '100%' }}>
      <Link to="/" style={{ flexShrink: 0 }}>
        <img src={logoImage} className="sm:w-36 w-24 max-w-none" />
      </Link>

      {/* Desktop navigation */}
      <HStack as="nav" spacing={{ base: "5", lg: "8" }} display={{ base: "none", md: "flex" }} flexShrink={1} overflowX="auto" css={{
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none'
      }}>
        <Link to="/">
          <Button
            paddingStart={0}
            paddingEnd={0}
            className="group hover:text-teal-500 focus:text-teal-500"
            variant="nav"
            _hover={{ transition: "all 0.3s ease-in-out" }}
            pos={"relative"}
            fontSize={{ base: "sm", lg: "md" }}
            whiteSpace="nowrap"
          >
            {t('header.home')}
            <Box
              position={"absolute"}
              className="w-0 h-[2px] bg-teal-500 rounded-xl bottom-0 left-0"
              _groupFocus={{ width: "100%" }}
              _groupHover={{
                width: "100%",
                transition: "all 0.3s ease-in-out",
              }}
            />
          </Button>
        </Link>
        {headerItems.map((item, i) => (
          <Button
            key={i}
            paddingStart={0}
            paddingEnd={0}
            className="group hover:text-teal-500 focus:text-teal-500"
            variant="nav"
            _hover={{ transition: "all 0.3s ease-in-out" }}
            pos={"relative"}
            onClick={() => handleNavigation(item)}
            fontSize={{ base: "sm", lg: "md" }}
            whiteSpace="nowrap"
          >
            {t(`header.${item.key}`)}
            <Box
              position={"absolute"}
              className="w-0 h-[2px] bg-teal-500 rounded-xl bottom-0 left-0"
              _groupFocus={{ width: "100%" }}
              _groupHover={{
                width: "100%",
                transition: "all 0.3s ease-in-out",
              }}
            />
          </Button>
        ))}
      </HStack>

      {/* Mobile: Language & Contact (right of logo) */}
      <Box display={{ base: 'flex', md: 'none' }} alignItems="center" gap={2} ml={2}>
        {/* Language selector */}
        {/* Social icons */}
        <HStack spacing={1}>
          <IconButton
            as="a"
            href={socialLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            icon={<FaTelegram />}
            size="sm"
            variant="ghost"
            colorScheme="telegram"
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
            variant="ghost"
            colorScheme="whatsapp"
            _hover={{ bg: "green.50", transform: "scale(1.1)" }}
            transition="all 0.2s"
          />
          <IconButton
            as="a"
            href={socialLinks.messenger}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Messenger"
            icon={<FaFacebookMessenger />}
            size="sm"
            variant="ghost"
            colorScheme="messenger"
            _hover={{ bg: "blue.50", transform: "scale(1.1)" }}
            transition="all 0.2s"
          />
        </HStack>
        {/* Phone number (first) */}
        <HStack spacing={1}>
          <FaPhone size={12} color="#319795" />
          <Text fontSize="xs" fontWeight="medium" color="teal.600">
            <a href={`tel:${phoneNumbers[0].number}`}>{phoneNumbers[0].display}</a>
          </Text>
        </HStack>
        <Select
          value={language}
          onChange={(e) => changeLanguageTo(e.target.value)}
          size="sm"
          width="80px"
          borderColor="teal.300"
          _hover={{ borderColor: "teal.500" }}
          focusBorderColor="teal.500"
        >
          <option value="en">EN</option>
          <option value="ru">RU</option>
        </Select>
      </Box>

      {/* Social Media Icons */}
      {/* Desktop social icons */}
      <HStack spacing={2} display={{ base: "none", lg: "flex" }} flexShrink={0}>
        <IconButton
          as="a"
          href={socialLinks.telegram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
          icon={<FaTelegram />}
          size="sm"
          variant="ghost"
          colorScheme="telegram"
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
          variant="ghost"
          colorScheme="whatsapp"
          _hover={{ bg: "green.50", transform: "scale(1.1)" }}
          transition="all 0.2s"
        />
        <IconButton
          as="a"
          href={socialLinks.messenger}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Messenger"
          icon={<FaFacebookMessenger />}
          size="sm"
          variant="ghost"
          colorScheme="messenger"
          _hover={{ bg: "blue.50", transform: "scale(1.1)" }}
          transition="all 0.2s"
        />
      </HStack>

      {/* Phone Numbers */}
      {/* Desktop phone numbers */}
      <VStack spacing={1} display={{ base: "none", xl: "flex" }} align="flex-start" flexShrink={0}>
        {phoneNumbers.map((phone, index) => (
          <HStack key={index} spacing={1}>
            <FaPhone size={12} color="#319795" />
            <Text fontSize="xs" fontWeight="medium" color="teal.600">
              <a href={`tel:${phone.number}`}>{phone.display}</a>
            </Text>
          </HStack>
        ))}
      </VStack>

      {/* Language Selector */}
      {/* Desktop language selector */}
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
        <option value="en">{t('lang.en')}</option>
        <option value="ru">{t('lang.ru')}</option>
      </Select>



      {/* <div>
        {!user?.id ? (
          <> */}
      {/* Temporarily disabled signin/signup */}
      {/* <Link to="/login">
              <Button
                colorScheme="teal"
                variant={location.pathname === '/login' || location.pathname === '/' ? 'solid' : 'outline'}
                size={{ base: "sm", md: "md" }}
              >
                Signin
              </Button>
            </Link>
            <Link to="/signup" className="ml-3">
              <Button
                colorScheme="teal"
                variant={location.pathname === '/signup' ? 'solid' : 'outline'}
                size={{ base: "sm", md: "md" }}
              >
                Signup
              </Button>
            </Link> */}
      {/* </>
        ) : (
          <Flex alignItems={"center"}>
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={"full"}
                    variant={"link"}
                    cursor={"pointer"}
                    minW={0}
                  >
                    <Avatar
                      size={"lg"}
                      src={user?.image}
                    />
                  </MenuButton>
                  <MenuList zIndex={99}>
                    <Center>
                      <Avatar
                        size={"2xl"}
                        src={user?.image}
                      />
                    </Center>
                    <Center>
                      <Text
                        color="teal.400"
                        fontWeight={500}
                        fontSize={18}
                        className="my-1 capitalize"
                      >
                        {user?.name}
                      </Text>
                    </Center>
                    <br />
                    <MenuDivider />
                    <MenuItem
                      justifyContent={"center"}
                      _hover={{ bg: "none" }}
                      _focus={{ bg: "none" }}
                      color="gray.700"
                      px="14px"
                    >
                      <Link
                        to="/profile"
                        className="w-full rounded-md hover:bg-teal-50 focus:bg-teal-50 text-center py-2"
                      >
                        <Text fontWeight={500} fontSize={16}>
                          Profile
                        </Text>
                      </Link>
                    </MenuItem>
                    <MenuItem
                      justifyContent={"center"}
                      _hover={{ bg: "none" }}
                      _focus={{ bg: "none" }}
                      color="gray.700"
                      px="14px"
                    >
                      <Link
                        to="/setting-profile/information"
                        className="w-full rounded-md hover:bg-teal-50 focus:bg-teal-50 text-center py-2"
                      >
                        <Text fontWeight={500} fontSize={16}>
                          Settings
                        </Text>
                      </Link>
                    </MenuItem>
                    <MenuItem
                      _hover={{ bg: "none" }}
                      _focus={{ bg: "none" }}
                      color="red.400"
                      borderRadius="8px"
                      px="14px"
                    >
                      <LogoutButton>
                        <TbLogout className="mr-2 text-red-500" />
                        <Text color="red.400">Logout</Text>
                      </LogoutButton>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            )}
          </div> */}
      <IconButton
        size={"sm"}
        aria-label="Toggle navigation"
        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
        onClick={onOpen}
        display={{ base: "block", md: "none" }}
      />
      <Drawer placement={"top"} onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay backdropFilter="blur(5px)" />
        <DrawerContent bg="white">
          <DrawerCloseButton size="lg" mt={2} />

          <DrawerBody display="flex" flexDirection="column" h="100%" py={8}>

            {/* PHẦN 1: MENU CHÍNH */}
            {/* align="center" để mọi thứ căn giữa trục dọc */}
            <VStack as="nav" spacing={5} flex="1" justify="center" w="full">
              <Link to="/">
                <Button
                  variant="ghost"
                  fontSize="lg"        // Giảm size chút cho tinh tế (từ xl -> lg)
                  fontWeight="medium"  // 👇 SỬA Ở ĐÂY: medium thay vì bold
                  color="gray.700"
                  _hover={{ color: "teal.600", bg: "teal.50" }}
                  onClick={onClose}
                  w="full"
                >
                  {t('header.home')}
                </Button>
              </Link>

              {headerItems.map((item, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  fontSize="lg"        // Giảm size chút
                  fontWeight="medium"  // 👇 SỬA Ở ĐÂY: medium thay vì bold
                  color="gray.700"
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

            <Divider my={6} borderColor="gray.100" />

            {/* PHẦN 2: TIỆN ÍCH */}
            <VStack spacing={6} pb={6} w="full"> {/* Thêm w="full" vào đây */}

              {/* Language Selector */}
              <Menu autoSelect={false}>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  leftIcon={<FaGlobeAsia />}
                  variant="outline"
                  size="sm"
                  borderColor="teal.200"
                  color="teal.600"
                  rounded="full"
                  fontWeight="medium"
                  _hover={{ bg: "teal.50", borderColor: "teal.500" }}
                  _active={{ bg: "teal.100" }}
                >
                  {t(`lang.${language}`)}
                </MenuButton>
                <MenuList minW="150px" fontSize="sm" zIndex={1500}>
                  <MenuItem onClick={() => changeLanguageTo('en')}>
                    🇺🇸 {t('lang.en')}
                  </MenuItem>
                  <MenuItem onClick={() => changeLanguageTo('ru')}>
                    🇷🇺 {t('lang.ru')}
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* Social Icons */}
              {/* 👇 SỬA Ở ĐÂY: Thêm w="full" và justify="center" để icon luôn ở giữa */}
              <HStack spacing={8} w="full" justify="center">
                <IconButton
                  as="a"
                  href={socialLinks.telegram}
                  target="_blank"
                  aria-label="Telegram"
                  icon={<FaTelegram size={22} />}
                  variant="unstyled"
                  color="gray.400"
                  _hover={{ color: "#0088cc", transform: "scale(1.2)" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.2s"
                />
                <IconButton
                  as="a"
                  href={socialLinks.whatsapp}
                  target="_blank"
                  aria-label="WhatsApp"
                  icon={<FaWhatsapp size={22} />}
                  variant="unstyled"
                  color="gray.400"
                  _hover={{ color: "#25D366", transform: "scale(1.2)" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.2s"
                />
                <IconButton
                  as="a"
                  href={socialLinks.messenger}
                  target="_blank"
                  aria-label="Messenger"
                  icon={<FaFacebookMessenger size={22} />}
                  variant="unstyled"
                  color="gray.400"
                  _hover={{ color: "#006AFF", transform: "scale(1.2)" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.2s"
                />
              </HStack>

              {/* Phone Numbers */}
              <VStack spacing={2}>
                {phoneNumbers.map((phone, index) => (
                  <Button
                    key={index}
                    as="a"
                    href={`tel:${phone.number}`}
                    leftIcon={<FaPhone size={12} />}
                    variant="link"
                    color="teal.600"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ textDecoration: 'none', color: 'teal.700' }}
                  >
                    {phone.display}
                  </Button>
                ))}
              </VStack>
            </VStack>

          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </header >
  );
};

export default Header;
