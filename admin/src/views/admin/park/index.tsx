import ParkTable from "./components/ParkTable";
import { useEffect, useState } from "react";
import useAuth from "utils/auth/AuthHook";

const Parks = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}parks`,
          { credentials: "include" }
        );
        const data = await response.json();

        // If token-based auth didn't propagate user to backend, also apply client-side filter
        let list = Array.isArray(data) ? data : [];
        if (user && user.role === "dealer") {
          list = list.filter((p: any) => p.dealer_id === user.id);
        }

        setTableData(list);
      } catch (error) {
        console.error("Error fetching parks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="mt-5">
      <div className="mb-5">
        <h3 className="text-3xl font-bold text-navy-700 dark:text-white">
          Parks Management
        </h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Manage all bike parking locations.
        </p>
      </div>
      <ParkTable tableContent={tableData} loading={loading} />
    </div>
  );
};

export default Parks;
