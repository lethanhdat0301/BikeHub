import BookingTable from "./components/BookingTable";
import { useEffect, useState } from "react";

const Bookings = () => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch only booking requests (not yet confirmed)
            const bookingRequestsRes = await fetch(`${process.env.REACT_APP_API_URL}booking-requests`, {
                credentials: "include"
            });

            const bookingRequestsData = await bookingRequestsRes.json();

            // Format booking requests data
            const formattedData = Array.isArray(bookingRequestsData) ? bookingRequestsData.map(br => ({
                ...br,
                type: 'booking-request',
                bookingId: `BK${String(br.id).padStart(6, '0')}`,
                customer_name: br.name,
                customer_phone: br.contact_details,
                vehicle_model: br.Bike?.model || 'Pending Assignment',
                dealer_name: br.Dealer?.name || 'Not Assigned',
                location: br.pickup_location,
                start_time: br.start_date,
                end_time: br.end_date,
                price: br.estimated_price || 0,
            })) : [];

            setTableData(formattedData);
        } catch (error) {
            console.error("Error fetching booking requests:", error);
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
                    Bookings
                </h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Manage all vehicle bookings across all dealers.
                </p>
            </div>
            <BookingTable tableContent={tableData} loading={loading} onRefresh={fetchData} />
        </div>
    );
};

export default Bookings;
