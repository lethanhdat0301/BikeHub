import BikeTable from "./components/BikeTable";
import { useEffect, useState } from "react";

const Bikes = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}bikes`,
          { credentials: "include" }
        );
        const data = await response.json();

        // Normalize response: accept array or { data: [...] } or error objects
        if (Array.isArray(data)) {
          // Normalize bikes to include explicit location property (Park.location preferred)
          setTableData(data.map((b: any) => ({
            ...b,
            location: b.Park?.location || b.location || "-",
          })));
        } else if (data && Array.isArray((data as any).data)) {
          setTableData((data as any).data.map((b: any) => ({
            ...b,
            location: b.Park?.location || b.location || "-",
          })));
        } else {
          setTableData([]);
        }
      } catch (error) {
        console.error("Error fetching bikes:", error);
        setTableData([]);
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
          Bikes Management
        </h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Manage all vehicles in the system.
        </p>
      </div>
      <BikeTable tableContent={tableData} loading={loading} />
    </div>
  );
};

export default Bikes;
