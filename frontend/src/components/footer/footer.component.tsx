import { Box, Button, Flex, Image, Link as A } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../../assets/images/logoofficial.png";

const Footer = () => {
  const navigate = useNavigate();
  const footerItems = [
    { label: "Search", path: "search" },
    { label: "Booking Request", path: "request-booking" },
    { label: "Return", path: "return" },
    { label: "Track Order", path: "tracking" },
    { label: "Terms of Service", path: "terms" },
    { label: "How It Works", path: "howItWork", isHash: true }
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
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-900 ">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="flex sm:flex-row flex-col  items-center md:justify-between">
          <Link to="/">
            <Image src={logoImage} width={"150px"} />
          </Link>
          <Flex gap="8" flex={1} justifyContent="center" flexDirection={{ base: "column", md: "row" }} alignItems="center">
            <Link to="/">
              <Button
                paddingStart={0}
                paddingEnd={0}
                className="group hover:text-teal-500 focus:text-teal-500"
                variant="nav"
                _hover={{ transition: "all 0.3s ease-in-out" }}
                pos={"relative"}
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

            {footerItems.map((item, i) => (
              <Button
                key={i}
                paddingStart={0}
                paddingEnd={0}
                className="group hover:text-teal-500 focus:text-teal-500"
                variant="nav"
                _hover={{ transition: "all 0.3s ease-in-out" }}
                pos={"relative"}
                onClick={() => handleNavigation(item)}
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
          </Flex>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-center text-gray-500 sm:text-center dark:text-gray-400">
          © 2025{" "}
          <Link to="/" className="hover:underline">
            RentnRide
          </Link>
          . All Rights Reserved.<br />
          <Link to="/terms" className="hover:underline text-teal-600">
            Terms of Service
          </Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
