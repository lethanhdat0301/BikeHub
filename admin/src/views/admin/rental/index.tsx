import RentalTable from "./components/RentalTable";
import { useEffect, useState } from "react";
import AdminTable from "../user/components/AdminTable"; // reuse generic table
import { Center, Spinner, Text, Box, Heading } from "@chakra-ui/react";

// 1. Define columns
const columnHeaders = [
  { id: "id", title: "Booking ID" },
  { id: "name", title: "Customer" },
  { id: "vehicle", title: "Vehicle" },
  { id: "rental_period", title: "Rental Period" },
  { id: "pickup_location", title: "Location" },
  { id: "price", title: "Price" },
  { id: "status", title: "Status" },
];

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

      const mapped = rentalsList.map((r: any) => ({
        id: `BK${String(r.id).padStart(6, '0')}`, // All use same booking_id_seq
        name: r.User?.name || r.contact_name || 'Guest',
        vehicle: r.Bike?.model || r.bike_id,
        rental_period: `${new Date(r.start_time).toLocaleDateString()}${r.end_time ? ` - ${new Date(r.end_time).toLocaleDateString()}` : ' - Ongoing'}`,
        pickup_location: r.Bike?.Park?.location || r.pickup_location || "-",
        price: r.price !== undefined && r.price !== null ? `$${r.price}` : '-',
        status: r.status,
      }));

      setTableData(mapped);
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
        <AdminTable tableContent={tableData} tableHeader={columnHeaders} moduleName={"rental"} />
      )}
    </Box>
  );
};

export default RentalsTable;