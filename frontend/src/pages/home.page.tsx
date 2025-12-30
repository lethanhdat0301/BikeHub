import React from "react";
import { Box } from "@chakra-ui/react";
import SearchBike from "../components/home/searchBike/searchBike.component";
import HowItWork from "../components/home/howItWork/howItWork.component";
import BikeList from "../components/home/bikes/bikeList.component";
import SwiperReviews from "../components/home/reviews/swiperReviews.component";
import WhyChoose from "../components/home/whyChoose/whyChoose.component";


const HomePage: React.FC = () => {
  console.log("🏠 HomePage rendered!");

  return (
    <Box overflowX="hidden" width="100%">
      <SearchBike />
      <HowItWork />
      <WhyChoose />
      <BikeList />
      <SwiperReviews />
    </Box>
  );
};

export default HomePage;
