import ReferrerTable from "./components/ReferrerTable";
import { useEffect, useState } from "react";

const Referrers = () => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}referrers`,
                    { credentials: "include" }
                );
                const data = await response.json();
                setTableData(data);
            } catch (error) {
                console.error("Error fetching referrers:", error);
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
                    Referral Management
                </h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Track and manage your referral partners and their earnings.
                </p>
            </div>
            <ReferrerTable tableContent={tableData} loading={loading} />
        </div>
    );
};

export default Referrers;
