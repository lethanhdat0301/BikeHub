import BookingTable from "./components/BookingTable";
import { useEffect, useState } from "react";

const Bookings = () => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}rentals/bookings`,
                    { credentials: "include" }
                );
                const data = await response.json();
                setTableData(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
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
                    Bookings
                </h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Manage all vehicle bookings across all dealers.
                </p>
            </div>
            <BookingTable tableContent={tableData} loading={loading} />
        </div>
    );
};

export default Bookings;
