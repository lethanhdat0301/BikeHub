import DealerTable from "./components/DealerTable";
import { useEffect, useState } from "react";

const Dealers = () => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}dealers`,
                { credentials: "include" }
            );
            const data = await response.json();
            setTableData(data);
        } catch (error) {
            console.error("Error fetching dealers:", error);
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
                    Dealer List
                </h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    A list of all dealers on the platform.
                </p>
            </div>
            <DealerTable tableContent={tableData} loading={loading} onRefresh={fetchData} />
        </div>
    );
};

export default Dealers;
