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
} from "@chakra-ui/react";
import { TbLogout } from "react-icons/tb";
import { FaTelegram, FaWhatsapp, FaFacebookMessenger, FaPhone } from "react-icons/fa";
import LogoutButton from "../logoutButton.component";
import { useAuth } from "../../hooks/useAuth";
import logoImage from "../../assets/images/logoofficial.png";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useLocation } from 'react-router-dom';
/**
 * Header: A functional component representing a header in React with Tailwind CSS.
 *
 * @returns {JSX.Element} - The JSX element representing the header.
 */
const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>('en');

  const headerItems = [
    { label: "Search", path: "search" },
    { label: "Booking Request", path: "request-booking" },
    { label: "Return", path: "return" },
    { label: "Track Order", path: "tracking" },
    { label: "How It Works", path: "howItWork", isHash: true }
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
    console.log('Language changed to:', e.target.value);
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
            Home
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
            {item.label}
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
          onChange={handleLanguageChange}
          size="sm"
          width="80px"
          borderColor="teal.300"
          _hover={{ borderColor: "teal.500" }}
          focusBorderColor="teal.500"
        >
          <option value="en">EN</option>
          <option value="vi">VI</option>
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
        onChange={handleLanguageChange}
        size="sm"
        width="90px"
        display={{ base: "none", lg: "block" }}
        borderColor="teal.300"
        _hover={{ borderColor: "teal.500" }}
        focusBorderColor="teal.500"
        flexShrink={0}
      >
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
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
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <VStack as="nav" spacing="6">
              <Link to="/">
                <Button
                  paddingStart={0}
                  paddingEnd={0}
                  className="group hover:text-teal-500 focus:text-teal-500"
                  variant="nav"
                  _hover={{ transition: "all 0.3s ease-in-out" }}
                  pos={"relative"}
                  onClick={onClose}
                >
                  Home
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
                  onClick={() => {
                    handleNavigation(item);
                    onClose();
                  }}
                >
                  {item.label}
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

              {/* Mobile: Language selector */}
              <Box w="100%">
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  size="md"
                  width="100%"
                  borderColor="teal.300"
                  _hover={{ borderColor: "teal.500" }}
                  focusBorderColor="teal.500"
                  mt={2}
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </Select>
              </Box>

              {/* Mobile: Social icons */}
              <HStack spacing={4} w="100%" justify="center" mt={2}>
                <IconButton
                  as="a"
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  icon={<FaTelegram />}
                  size="md"
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
                  size="md"
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
                  size="md"
                  variant="ghost"
                  colorScheme="messenger"
                  _hover={{ bg: "blue.50", transform: "scale(1.1)" }}
                  transition="all 0.2s"
                />
              </HStack>

              {/* Mobile: Phone numbers */}
              <VStack spacing={1} align="center" w="100%" mt={2}>
                {phoneNumbers.map((phone, index) => (
                  <HStack key={index} spacing={1}>
                    <FaPhone size={14} color="#319795" />
                    <Text fontSize="sm" fontWeight="medium" color="teal.600">
                      <a href={`tel:${phone.number}`}>{phone.display}</a>
                    </Text>
                  </HStack>
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
