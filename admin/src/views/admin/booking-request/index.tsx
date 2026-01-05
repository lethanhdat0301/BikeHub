import BookingRequestTable from "./components/BookingRequestTable";
import { useEffect, useState } from "react";

const BookingRequests = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}booking-requests`,
        { credentials: "include" }
      );
      const data = await response.json();
      setTableData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mt-5">
      <div className="mb-5">
        <h3 className="text-3xl font-bold text-navy-700 dark:text-white">
          Booking Requests
        </h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Manage customer booking requests and convert them to rentals.
        </p>
      </div>
      <BookingRequestTable 
        tableContent={tableData} 
        loading={loading} 
        onRefresh={fetchData}
      />
    </div>
  );
};

export default BookingRequests;
