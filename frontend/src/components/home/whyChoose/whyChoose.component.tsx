import { Box, Container, Heading, Image, Text } from "@chakra-ui/react";
import { IoTimeOutline } from "react-icons/io5";
import { CiWallet } from "react-icons/ci";
import { MdDirectionsBike } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { Reveal } from "../../motion/reveal.component";
import { IconType } from "react-icons";

import BikeImage from "../../../assets/images/bikes/Whychoose.jpg";

type CardChooseProps = {
  id: number;
  title: string;
  description: string;
  Icon: IconType;
};
const CardChoose = ({ id, title, description, Icon }: CardChooseProps) => {
  return (
    <Box
      key={id}
      className="group flex items-center justify-center bg-white rounded-lg px-8 py-4 gap-4 transition-all duration-300 ease-in-out cursor-pointer"
      width={{ base: "80%", md: "400px" }}
      height={{ base: "auto", md: "150px" }}
      shadow={
        "0px 0px 25px -5px rgba(0, 0, 0, 0.1), 0px 7px 10px -5px rgba(0, 0, 0, 0.04)"
      }
      _hover={{
        color: "white",
        bg: "teal.400",
        shadow: "2xl",
        transform: "scale(1.05)",
        transition: "all 0.3s ease-in-out",
      }}
    //   _groupHover={{ color: "white" }}
    >
      <Box
        // width={{ base: "50px", md: "80px" }}
        className="flex items-center justify-center rounded-full  bg-teal-200 p-3"
        _groupHover={{ bg: "teal.300", transition: "all 0.3s ease-in-out" }}
      >
        <Icon className="text-teal-500 sm:text-3xl text-xl  group-hover:text-white" />
      </Box>
      <Box
        className="flex flex-col items-start justify-center gap-2"
        _groupHover={{ color: "white", transition: "all 0.3s ease-in-out" }}
      >
        <Reveal>
          <Heading
            as="h2"
            size={{ base: "14px", md: "18px" }}
            // fontSize={"18px"}
            className="capitalize"
          >
            {title}
          </Heading>
        </Reveal>
        <Reveal>
          <Text
            className="text-gray-500 sm:text-sm text-xs font-normal"
            _groupHover={{ color: "white", transition: "all 0.3s ease-in-out" }}
          >
            {description}
          </Text>
        </Reveal>
      </Box>
    </Box>
  );
};

const WhyChoose = () => {
  const { t } = useTranslation();
  const data = [
    {
      id: 1,
      title: t('home.smartBookingTitle'),
      description: t('home.smartBookingDesc'),
      icon: IoTimeOutline,
    },
    {
      id: 2,
      title: t('home.doorstepDeliveryTitle'),
      description: t('home.doorstepDeliveryDesc'),
      icon: CiWallet,
    },
    {
      id: 3,
      title: t('home.flexiblePaymentTitle'),
      description: t('home.flexiblePaymentDesc'),
      icon: MdDirectionsBike,
    },
  ];
  return (
    <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
      <Box
        id="chooseUs"
        className="relative flex flex-col  justify-center items-center gap-12 my-5 py-5 "
      //   height="90vh"
      >
        <Box
          className="absolute w-2/5 h-full top-1 right-12 bg-teal-100 -z-10 opacity-25"
          clipPath={"polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%)"}
          display={{ base: "none", md: "block" }}
        />
        <Reveal>
          <Heading
            as="h2"
            size={{ base: "sm", md: "xl" }}
            className=" mb-3 capitalize"
            mt={100}
            textAlign="center"
            px={{ base: 4, md: 0 }}
          >
            {t('home.whyChooseTitle')}
          </Heading>
        </Reveal>
        {/* <Reveal>
          <Box px={{ base: 4, md: 0 }} textAlign="center">
            <Text className="text-gray-500 sm:text-base text-sm font-medium mb-5" maxWidth="600px" mb={2} mx="auto">
              🚲 Dive into urban adventures on stylish, eco-friendly bikes.
            </Text>
            <Text className="text-gray-500 sm:text-base text-sm font-medium mb-5" maxWidth="600px" mb={2} mx="auto">
              ⚙️ Easy Rentals: Swift and smart with our user-friendly app.
            </Text>
            <Text className="text-gray-500 sm:text-base text-sm font-medium mb-5" maxWidth="600px" mb={2} mx="auto">
              🌍 Eco-Friendly: Ride green, reduce your carbon footprint.
            </Text>
            <Text className="text-gray-500 sm:text-base text-sm font-medium mb-5" maxWidth="600px" mb={2} mx="auto">
              🤝 Community Vibes: Join a cyclist family!
            </Text>
            <Text className="text-gray-500 sm:text-base text-sm font-medium mb-5" maxWidth="600px" mx="auto">
              Choose RentnRide – Where Every Ride is an Adventure!🚴‍♀️
            </Text>
          </Box>
        </Reveal> */}
        <Box className=" w-full flex md:flex-row flex-col justify-evenly gap-5 items-center">
          <Box className="flex-1 text-center">
            <Image
              src={BikeImage}
              mx={"auto"}
              width={{ base: "80%", md: "100%" }}
              mt={10}
            />
          </Box>
          <Box className="flex flex-1 flex-col gap-4 justify-center items-center">
            {data.map((item) => (
              <CardChoose
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                Icon={item.icon}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default WhyChoose;
