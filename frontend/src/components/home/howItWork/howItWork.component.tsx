import { Center, Flex, Heading, Box, Text } from "@chakra-ui/react";
import React from "react";
import { Reveal } from "../../motion/reveal.component";
import {
  FaMagnifyingGlass,
  FaCalendarDays,
  FaMotorcycle,
  FaTruckFast,
} from "react-icons/fa6";

import CardSteps from "./cardSteps.component";

const HowItWork: React.FC = () => {
  const dataSteps = [
    {
      icon: FaMagnifyingGlass,
      title: "Find Your Bike",
      text: "Browse our wide selection of motorcycles and find the perfect one for your trip.",
      after: true,
      delay: 0.5,
      id: 1,
    },
    {
      icon: FaCalendarDays,
      title: "Book & Pay",
      text: "Select your rental dates, provide your details, and complete the secure payment.",
      after: true,
      delay: 1.0,
      id: 2,
    },
    {
      icon: FaMotorcycle,
      title: "Receive Your Bike",
      text: "We deliver the motorcycle directly to your location at the specified time.",
      after: true,
      delay: 1.5,
      id: 3,
    },
    {
      icon: FaTruckFast,
      title: "Free Delivery & Return",
      text: "We will deliver and pick up the motorcycle right at your location with no extra fee.",
      after: false,
      delay: 2,
      id: 4,
    },
  ];
  return (
    <Flex
      id="howToRent"
      justifyContent={"space-around"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={6}
      py={"30px"}
      minHeight={"80vh"}
      className="relative"
    >
      <Center flexDirection={"column"} gap={4}>
        <Box
          className="absolute w-full h-full top-0 left-0 bg-teal-100 opacity-25 -z-10"
          clipPath={"circle(30.2% at 10% 50%)"}
        />
        <Box
          className="absolute w-full h-full top-0 left-0 bg-teal-100 opacity-25 -z-10"
          clipPath={"circle(30.2% at 50% 10%)"}
        />
        <Box
          className="absolute w-full h-full top-0 left-0 bg-teal-100 opacity-25 -z-10"
          clipPath={"circle(20.2% at 90% 5%)"}
        />
        <Reveal>
          <Heading
            as="h3"
            size={{ base: "sm", md: "2xl" }}
            className="capitalize text-center"
          >
            How It Works
          </Heading>
        </Reveal>
      </Center>
      <Flex flexDirection={{ base: "column", md: "row" }} gap={4} justifyContent="space-between">
        {dataSteps.map(({ icon, title, text, id, after, delay }) => (
          <CardSteps
            key={id}
            Icon={icon}
            title={title}
            text={text}
            after={after}
            delay={delay}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default HowItWork;
