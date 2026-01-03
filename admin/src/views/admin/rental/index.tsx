// import AdminTable from "../user/components/AdminTable";
// import { useEffect, useState } from "react";
// import useAuth from "../../../utils/auth/AuthHook";
// // import bookingRequestService, { BookingRequest } from "../../../services/bookingRequestService";

// const columnHeaders = [
//   {
//     id: "id",
//     title: "ID",
//   },
//   {
//     id: "status",
//     title: "Status",
//   },
//   {
//     id: "price",
//     title: "Price",
//   },
//   {
//     id: "bike_id",
//     title: "Bike ID",
//   },
//   {
//     id: "user_id",
//     title: "User ID",
//   },
// ];

// const Tables = () => {
//   const [tableData, setTableData] = useState([]);
//   const { user } = useAuth();

//   useEffect(() => {
//     const fetchData = async () => {
//       let url = `${process.env.REACT_APP_API_URL}rentals`;
//       if (user && user.role === "dealer") {
//         // limit rentals to bikes belonging to this dealer
//         url += `?dealer_id=${user.id}`;
//       }
//       const response = await fetch(url, { credentials: "include" });
//       console.log("-response------------")
//       console.log(response)
//       console.log("-------------")
//       const data = await response.json();
//       console.log("-response------------")
//       console.log(data)
//       console.log("-------------")
//       if (Array.isArray(data)) setTableData(data);
//       else if (data && Array.isArray((data as any).data)) setTableData((data as any).data);
//       else setTableData([]);
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="mt-5">
//       <AdminTable
//         tableContent={tableData}
//         tableHeader={columnHeaders}
//         moduleName={"rental"}
//       />
//     </div>
//   );
// };

// export default Tables;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch rentals (includes User and Bike with Park)
        const [rRes, uRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}rentals`, { credentials: "include" }),
          fetch(`${process.env.REACT_APP_API_URL}users`, { credentials: "include" }),
        ]);
        const rData = await rRes.json();
        const uData = await uRes.json();
        const rentalsList = Array.isArray(rData) ? rData : (rData && Array.isArray((rData as any).data) ? (rData as any).data : []);
        const usersList = Array.isArray(uData) ? uData : (uData && Array.isArray((uData as any).data) ? (uData as any).data : []);

        const mapped = rentalsList.map((r: any) => ({
          id: r.id,
          name: r.User?.name || r.user_id,
          vehicle: r.Bike?.model || r.bike_id,
          rental_period: `${new Date(r.start_time).toLocaleString()}${r.end_time ? ` - ${new Date(r.end_time).toLocaleString()}` : ''}`,
          pickup_location: r.Bike?.Park?.location || r.pickup_location || "-",
          price: r.price !== undefined && r.price !== null ? r.price : '-',
          status: r.status,
        }));

        setTableData(mapped);
      } catch (error) {
        console.error("Error loading rentals:", error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Center p={10}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box className="mt-5" px={4}>
      <Heading size="md" mb={4} color="teal.600">
        Rentals
      </Heading>

      {tableData.length === 0 ? (
        <Text color="gray.500">No rentals found.</Text>
      ) : (
        <AdminTable tableContent={tableData} tableHeader={columnHeaders} moduleName={"rental"} />
      )}
    </Box>
  );
};

export default RentalsTable;