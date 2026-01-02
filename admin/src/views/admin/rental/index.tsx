import RentalTable from "./components/RentalTable";
import { useEffect, useState } from "react";

const Rentals = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}rentals/list`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          setTableData(data);
        } else if (data && Array.isArray((data as any).data)) {
          setTableData((data as any).data);
        } else {
          setTableData([]);
        }
      } catch (error) {
        console.error("Error fetching rentals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mt-5">
      <div className="mb-5">
        <h3 className="text-3xl font-bold text-navy-700 dark:text-white">
          Rentals Management
        </h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Manage all rental transactions.
        </p>
      </div>
      <RentalTable tableContent={tableData} loading={loading} />
    </div>
  );
};

export default Rentals;