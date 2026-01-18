import { useRef, useState } from "react";
import { Heading, Box, Center, Text, Flex } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Reveal } from "../../motion/reveal.component";
import CardReview from "./cardReview.component";
import { Swiper, SwiperSlide } from "swiper/react";
import { HiArrowRight, HiArrowLeft } from "react-icons/hi2";
import { Swiper as SwiperCore } from "swiper/types";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import "../../../index.css";

// import required modules

const SwiperReviews = () => {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperCore>();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      name: `— ${t('home.review1Author')}, ${t('home.review1Title')}`,
      tag: t('home.review1Tag'),
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      review: t('home.review1Text'),
    },
    {
      id: 2,
      name: `— ${t('home.review2Author')}, ${t('home.review2Title')}`,
      tag: t('home.review2Tag'),
      avatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

      review: t('home.review2Text'),
    },
    {
      id: 3,
      name: `— ${t('home.review3Author')}, ${t('home.review3Title')}`,
      tag: t('home.review3Tag'),
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

      review: t('home.review3Text'),
    },
    {
      id: 4,
      name: `— ${t('home.review4Author')}, ${t('home.review4Title')}`,
      tag: t('home.review4Tag'),
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

      review: t('home.review4Text'),
    },
  ];

  return (
    <Flex
      id="clients"
      height={"70vh"}
      className="relative md:flex-row flex-col items-center justify-end gap-4"
    >
      <Box
        className="absolute w-3/6 h-full top-1 right-1 bg-teal-100 opacity-25"
        clipPath={"polygon(100% 0, 41% 0, 100% 89%)"}
      />
      <Box
        className="absolute w-2/5 h-full top-0 left-0 bg-teal-100 opacity-25"
        clipPath={"circle(62.2% at 13% 80%)"}
      />

      <Center
        width={"300px"}
        justifyContent={"end"}
        alignItems={"center"}
        // alignItems={{ base: "start", md: "center" }}
        flexDirection={"column"}
        gap={4}
      >
        <Reveal>
          <Heading
            as="h2"
            size={{ base: "md", md: "lg" }}
            className="capitalizesl sm:text-start text-center"
          >
            {t('home.whatOurRidersSay')}
          </Heading>
        </Reveal>
        <Reveal>
          <Text className="text-gray-500 sm:text-base text-sm font-medium sm:text-start text-center">
            {t('home.discoveringVietnam')}
          </Text>
        </Reveal>
        <Flex gap={3} alignSelf={{ base: "center", md: "start" }} zIndex={99}>
          <div
            className="cursor-pointer"
            onClick={() => {
              swiperRef.current?.slidePrev();
            }}
          >
            <HiArrowLeft
              className={`cursor-pointer font-bold transform hover:scale-125 transition-transform ${activeSlideIndex === 0 ? 'text-gray-500' : 'text-green-500'}`}
              size={28}
            />
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              swiperRef.current?.slideNext();
            }}
          >
            <HiArrowRight
              className={`cursor-pointer font-bold transform hover:scale-125 transition-transform ${activeSlideIndex === reviews.length - 1 ? 'text-gray-500' : 'text-green-500'}`}
              size={28}
            />
          </div>
        </Flex>
      </Center>
      <Box className="sm:w-2/3  w-11/12">
        <Swiper
          slidesPerView={1}
          spaceBetween={18}
          onSlideChange={(swiper) => {
            setActiveSlideIndex(swiper.activeIndex);
          }}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="mySwiper py-5 px-[10px]"
        >
          {reviews.map((review, i) => {
            return (
              <SwiperSlide key={i}>
                {({ isActive }) => (
                  <CardReview review={review} isActive={isActive} />
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>
    </Flex>
  );
};

export default SwiperReviews;
