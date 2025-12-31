import AdminTable from "../user/components/AdminTable";
import { useEffect, useState } from "react";
import useAuth from "../../../utils/auth/AuthHook";

const columnHeaders = [
  {
    id: "id",
    title: "ID",
  },
  {
    id: "status",
    title: "Status",
  },
  {
    id: "price",
    title: "Price",
  },
  {
    id: "bike_id",
    title: "Bike ID",
  },
  {
    id: "user_id",
    title: "User ID",
  },
];

const Tables = () => {
  const [tableData, setTableData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      let url = `${process.env.REACT_APP_API_URL}rentals`;
      if (user && user.role === "dealer") {
        // limit rentals to bikes belonging to this dealer
        url += `?dealer_id=${user.id}`;
      }
      const response = await fetch(url, { credentials: "include" });
      console.log("-response------------")
      console.log(response)
      console.log("-------------")
      const data = await response.json();
      console.log("-response------------")
      console.log(data)
      console.log("-------------")
      if (Array.isArray(data)) setTableData(data);
      else if (data && Array.isArray((data as any).data)) setTableData((data as any).data);
      else setTableData([]);
    };

    fetchData();
  }, []);

  return (
    <div className="mt-5">
      <AdminTable
        tableContent={tableData}
        tableHeader={columnHeaders}
        moduleName={"rental"}
      />
    </div>
  );
};

export default Tables;
