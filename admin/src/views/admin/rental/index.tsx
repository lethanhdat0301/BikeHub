import RentalTable from "./components/RentalTable";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Center, Spinner, Text, Box, Heading, Badge } from "@chakra-ui/react";
import useAuth from "utils/auth/AuthHook";

const RentalsTable = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Get dealer filter from URL params
  const dealerId = searchParams.get('dealer');
  const dealerName = searchParams.get('dealerName');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch rentals (includes User and Bike with Park)
      const response = await fetch(`${process.env.REACT_APP_API_URL}rentals`, {
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view rentals');
        } else {
          setError(`Failed to fetch rentals: ${response.statusText}`);
        }
        console.error('Failed to fetch rentals:', response.status, response.statusText);
        setTableData([]);
        return;
      }

      const rData = await response.json();
      console.log('Rentals data:', rData);

      const rentalsList = Array.isArray(rData) ? rData : [];

      // Filter by dealer if specified in URL params
      const filteredRentals = dealerId
        ? rentalsList.filter((rental: any) =>
          rental.Bike && (
            rental.Bike.dealer_id === parseInt(dealerId) ||
            (rental.Bike.Park && rental.Bike.Park.dealer_id === parseInt(dealerId))
          )
        )
        : rentalsList;

      setTableData(filteredRentals);
    } catch (error) {
      console.error("Error loading rentals:", error);
      setError('Failed to load rentals. Please try again.');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dealerId]); // Refetch when dealer filter changes

  return (
    <Box className="mt-5" px={4}>
      <Box mb={4} display="flex" alignItems="center" gap={3}>
        <Heading size="md" color="teal.600">
          Rentals
        </Heading>
        {dealerName && (
          <Badge colorScheme="blue" variant="solid" px={3} py={1} borderRadius="full">
            Dealer: {dealerName}
          </Badge>
        )}
      </Box>
      {error ? (
        <Box
          bg="red.100"
          border="1px"
          borderColor="red.400"
          borderRadius="md"
          p={4}
          mb={4}
        >
          <Text color="red.700" fontWeight="medium">
            {error}
          </Text>
        </Box>
      ) : loading ? (
        <Center h="200px">
          <Spinner size="xl" color="teal.500" />
        </Center>
      ) : (
        <RentalTable
          tableContent={tableData}
          loading={loading}
          onRefresh={fetchData}
          userRole={user?.role}
        />
      )}
    </Box>
  );
};

export default RentalsTable;