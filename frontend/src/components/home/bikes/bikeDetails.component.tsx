import {
  Modal,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  // useDisclosure,
  Flex,
  Box,
  Text,
  Heading,
  TagLabel,
  Tag,
} from "@chakra-ui/react";
import { Bike } from "./cardBike.component";
import bikeImage from "../../../assets/images/bikes/bike1.jpg";
import { TbManualGearbox } from "react-icons/tb";
import { MdSpeed } from "react-icons/md";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { MdDoneAll } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { useTranslation } from 'react-i18next';

import { generatePath, useNavigate } from "react-router-dom";

type Model = {
  isOpen: boolean;
  onClose: () => void;
  bike: Bike;
};
enum Status {
  available = "green",
  maintenance = "blue",
  rented = "red",
}

const BikeDetails = ({ isOpen, onClose, bike }: Model) => {
  // const [errData, setErrData] = useState({
  //   pickUp: false,
  //   returnTime: false,
  // });

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBooking = () => {
    bike.id && navigate(generatePath(`/booking/${bike.id}`));
  };

  return (
    <>
      <Modal onClose={onClose} size={{ base: "full", md: "4xl" }} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }} my={{ base: 4, md: "auto" }} maxH={{ base: "90vh", md: "auto" }} overflowY={{ base: "auto", md: "initial" }}>
          <ModalHeader className="flex gap-3 items-center">
            <Text className="font-bold text-teal-700">{bike.model}</Text>
            <Tag
              size={"md"}
              borderRadius="lg"
              variant="solid"
              colorScheme={Status[bike.status as keyof typeof Status]}
            >
              <TagLabel>{bike.status}</TagLabel>
            </Tag>
            <Tag
              size={"md"}
              borderRadius="lg"
              variant="solid"
              colorScheme={Status[bike.status as keyof typeof Status]}
            >
            </Tag>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              gap={6}
              flexDirection={{ base: "column", md: "row" }}
              alignItems={{ base: "center", md: "flex-start" }}
            >
              <Box
                className="md:w-5/12 w-full h-80 rounded-lg"
                position={"relative"}
                bgImage={bike.image ? bike.image : bikeImage}
                bgColor={"gray.100"}
                bgPosition={"center"}
                bgRepeat={"no-repeat"}
                bgSize={"cover"}
                shadow={"md"}
              ></Box>
              <Flex
                className="flex-1 w-full"
                flexDirection={"column"}
                shadow={"md"}
                bg={"gray.50"}
                p={4}
                rounded={"lg"}
              >
                <Box className="flex gap-2  flex-col sm:flex-row">
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <IoPersonOutline size={26} color="orange" />
                    <Text className="text-gray-800 font-medium">
                      {t('bike.minimalDriverAge')}: 
                    </Text>
                    <Text className="text-gray-500 font-medium">15</Text>
                  </Flex>

                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <TbManualGearbox size={26} color="orange" />
                    <Text className="text-gray-800 font-medium">{t('bike.gearbox')}:</Text>
                    <Text className="text-gray-500 font-medium">2</Text>
                  </Flex>
                </Box>
                <Box className="flex gap-2  flex-col sm:flex-row">
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <MdSpeed size={26} color="orange" />
                    <Text className="text-gray-800 font-medium">{t('bike.mileage')}:</Text>
                    <Text className="text-gray-500 font-medium">Unlimited</Text>
                  </Flex>
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <AiOutlineDollarCircle size={26} color="orange" />
                    <Text className="text-gray-800 font-medium">
                      {t('bike.priceFrom')}:
                    </Text>
                    <Text className="text-gray-500 font-medium">
                      {Number(bike?.price).toLocaleString('vi-VN')} VNĐ/hour
                    </Text>
                  </Flex>
                </Box>
                <Box className="flex gap-2  flex-col sm:flex-row">
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <MdOutlineAirlineSeatReclineNormal
                      size={26}
                      color="orange"
                    />
                    <Text className="text-gray-800 font-medium">
                      {t('bike.maxPassengers')}:
                    </Text>
                    <Text className="text-gray-500 font-medium">2</Text>
                  </Flex>
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <IoLocationOutline size={26} color="orange" />
                    <Text className="text-gray-800 font-medium">{t('bike.location')}:</Text>
                    <Text className="text-gray-500 font-medium">
                      {bike.location}
                    </Text>
                  </Flex>
                </Box>
                <Heading
                  w={"fit-content"}
                  py={2}
                  marginTop={8}
                  as="h3"
                  size={{ base: "xs", md: "sm" }}
                  className="capitalize"
                  borderBottom={"2px solid gray"}
                >
                  {t('bike.additionalInfo')}
                </Heading>
                <Box className="flex gap-2 flex-col sm:flex-row">
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <MdDoneAll size={18} color="teal" />
                    <Text className="text-gray-800 font-medium">
                      {t('bike.marinAlloy')}
                    </Text>
                  </Flex>
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <MdDoneAll size={18} color="teal" />
                    <Text className="text-gray-800 font-medium">
                      {t('bike.safetyHelmet')}
                    </Text>
                  </Flex>
                </Box>
                <Box className="flex gap-2 flex-col sm:flex-row">
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <MdDoneAll size={18} color="teal" />
                    <Text className="text-gray-800 font-medium">
                      {t('bike.sunRaceCassette')}
                    </Text>
                  </Flex>
                  <Flex className="sm:w-1/2 w-full gap-2 border-b py-2">
                    <MdDoneAll size={18} color="teal" />
                    <Text className="text-gray-800 font-medium">
                      {t('bike.tubelessCompatible')}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Box>
              <Button onClick={onClose} variant={"outline"} colorScheme="teal">
                Close
              </Button>
              <Button
                ml={4}
                variant={"solid"}
                colorScheme="teal"
                onClick={handleBooking}
              >
                {t('bike.bookNow')}
              </Button>
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BikeDetails;
