import AdminTable from "../user/components/AdminTable";
import { useEffect, useState } from "react";
// import useAuth from "../../../utils/auth/AuthHook";

const columnHeaders = [
  { id: "image", title: "Image" },
  { id: "id", title: "Vehicle ID" },
  { id: "model", title: "Model" },
  { id: "status", title: "Status" },
  { id: "seats", title: "Seats" },
  { id: "location", title: "Location" },
  { id: "price", title: "Price" },
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
        // Not an array — avoid passing non-array to the table
        setTableData([]);
      }
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
