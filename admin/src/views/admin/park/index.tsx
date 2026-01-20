import ParkTable from "./components/ParkTable";
import { useEffect, useState } from "react";

const Parks = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}parks`,
        { credentials: "include" }
      );
      const data = await response.json();
      setTableData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching parks:", error);
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
          Parks Management
        </h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Manage all motorbike parking locations.
        </p>
      </div>
      <ParkTable tableContent={tableData} loading={loading} onRefresh={fetchData} />
    </div>
  );
};

export default Parks;
