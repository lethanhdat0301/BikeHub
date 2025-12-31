import AdminTable from "../user/components/AdminTable";
import { useEffect, useState } from "react";
import useAuth from "utils/auth/AuthHook";

const columnHeaders = [
  {
    id: "id",
    title: "ID",
  },
  {
    id: "name",
    title: "Name",
  },
  {
    id: "location",
    title: "Location",
  },
  {
    id: "created_at",
    title: "Joined At",
  },
];

const Tables = () => {
  const [tableData, setTableData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [user]);

  return (
    <div className="mt-5">
      <AdminTable
        tableContent={tableData}
        tableHeader={columnHeaders}
        moduleName={"park"}
      />
    </div>
  );
};

export default Tables;
