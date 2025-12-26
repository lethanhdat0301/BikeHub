import React from "react";
import LandingSwiper from "../components/home/landingSwiper/landingSwiper.component";
import HowItWork from "../components/home/howItWork/howItWork.component";
import SwiperBikes from "../components/home/bikes/swiperBikes.component";
import SwiperReviews from "../components/home/reviews/swiperReviews.component";
import WhyChoose from "../components/home/whyChoose/whyChoose.component";


const HomePage: React.FC = () => {
  return (
    <>
      <LandingSwiper />
      <HowItWork />
      <WhyChoose />
      <SwiperBikes />
      <SwiperReviews />
    </>
  );
};

export default HomePage;
