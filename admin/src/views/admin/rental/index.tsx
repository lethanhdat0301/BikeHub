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
import AdminTable from "../user/components/AdminTable"; // Tận dụng lại bảng cũ của bạn
import bookingRequestService, { BookingRequest } from "../../../services/bookingRequestService";
import { Center, Spinner, Text, Badge, Box, Heading } from "@chakra-ui/react";

// 1. Định nghĩa các cột muốn hiển thị
const columnHeaders = [
  {
    id: "id",
    title: "ID",
  },
  {
    id: "name",
    title: "Customer Name",
  },
  {
    id: "email",
    title: "Email",
  },
  {
    id: "contact_details",
    title: "Contact",
  },
  {
    id: "pickup_location",
    title: "Pickup Location",
  },
  {
    id: "status",
    title: "Status",
  },
];

const BookingRequestTable = () => {
  const [tableData, setTableData] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔄 Đang tải danh sách Booking Requests...");

        // Gọi API qua Service (đã cấu hình Axios + Token)
        const data = await bookingRequestService.getAllBookingRequests();

        console.log("✅ Dữ liệu nhận được:", data);

        if (Array.isArray(data)) {
          setTableData(data);
        } else {
          setTableData([]);
        }
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu:", error);
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
        Booking Requests Management
      </Heading>

      {tableData.length === 0 ? (
        <Text color="gray.500">Chưa có yêu cầu đặt xe nào.</Text>
      ) : (
        <AdminTable
          tableContent={tableData}
          tableHeader={columnHeaders}
          moduleName={"booking-requests"}
        />
      )}
    </Box>
  );
};

export default BookingRequestTable;