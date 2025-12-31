import AdminTable from "../user/components/AdminTable";
import { useEffect, useState } from "react";
// import useAuth from "../../../utils/auth/AuthHook";

const columnHeaders = [
  {
    id: "id",
    title: "ID",
  },
  {
    id: "model",
    title: "Model",
  },
  {
    id: "status",
    title: "Status",
  },
  {
    id: "price",
    title: "Price Tier",
  },
  {
    id: "park_id",
    title: "Park ID",
  },
  {
    id: "created_at",
    title: "Joined At",
  },
];

const Tables = () => {
  const [tableData, setTableData] = useState([]);
  // const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}bikes`,
        { credentials: "include" }
      );
      // let url = `${process.env.REACT_APP_API_URL}bikes`;
      // if (user && user.role === "dealer") {
      //   url += `?dealer_id=${user.id}`;
      // }
      // const response = await fetch(url, { credentials: "include" });
      console.log("-response------------")
      console.log(response)
      const data = await response.json();
      console.log("-data------------")
      console.log(data)
      console.log("-------------")
      setTableData(data);
      // normalize response: accept array or { data: [...] }
      // if (Array.isArray(data)) setTableData(data);
      // else if (data && Array.isArray((data as any).data)) setTableData((data as any).data);
      // else setTableData([]);
    };
    fetchData();
  }, []);

  return (
    <div className="mt-5">
      <AdminTable
        tableContent={tableData}
        tableHeader={columnHeaders}
        moduleName={"bike"}
      />
    </div>
  );
};

export default Tables;
