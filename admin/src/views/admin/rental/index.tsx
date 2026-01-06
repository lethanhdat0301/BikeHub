import RentalTable from "./components/RentalTable";
import { useEffect, useState } from "react";
import { Center, Spinner, Text, Box, Heading } from "@chakra-ui/react";

const RentalsTable = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setTableData(rentalsList);
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
  }, []);

  return (
    <Box className="mt-5" px={4}>
      <Heading size="md" mb={4} color="teal.600">
        Rentals
      </Heading>
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
        />
      )}
    </Box>
  );
};

export default RentalsTable;