import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onSuccess: () => void;
};

const UpdateBookingRequestModal: React.FC<Props> = ({ isOpen, onClose, booking, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [bikes, setBikes] = useState<any[]>([]);
    const [dealers, setDealers] = useState<any[]>([]);

    // State cho form cập nhật booking
    const [formData, setFormData] = useState({
        dealer_id: "",
        bike_id: "",
        start_date: "",
        end_date: "",
        pickup_location: "",
        status: "PENDING",
        estimated_price: 0,
    });

    // Fetch danh sách xe, dealers và điền dữ liệu khi mở modal
    useEffect(() => {
        if (isOpen && booking) {
            fetchBikes();
            fetchDealers();

            // Auto-fill dữ liệu từ booking hiện tại vào form
            setFormData({
                dealer_id: booking.dealer_id || "",
                bike_id: booking.bike_id || "",
                start_date: booking.start_date ? formatDateForInput(booking.start_date) : "",
                end_date: booking.end_date ? formatDateForInput(booking.end_date) : "",
                pickup_location: booking.pickup_location || "",
                status: booking.status || "PENDING",
                estimated_price: booking.estimated_price || 0,
            });
        }
    }, [isOpen, booking]);

    // Helper để format date sang yyyy-MM-ddThh:mm (cho input datetime-local)
    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const fetchBikes = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}bikes`, {
                credentials: "include",
            });
            const data = await response.json();
            setBikes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching motorbikes:", error);
        }
    };

    const fetchDealers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}users/dealers`, {
                credentials: "include",
            });
            const data = await response.json();
            // console.log('Dealers fetched:', data);
            setDealers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching dealers:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate price when bike or dates change
            if (name === 'bike_id' || name === 'start_date' || name === 'end_date') {
                const selectedBike = bikes.find(b => b.id === Number(updated.bike_id));
                if (selectedBike && updated.start_date && updated.end_date) {
                    const start = new Date(updated.start_date);
                    const end = new Date(updated.end_date);

                    // Check if same day
                    const startDate = start.toDateString();
                    const endDate = end.toDateString();

                    if (startDate === endDate) {
                        // Same day booking - check hours
                        const timeDiffMs = end.getTime() - start.getTime();
                        const hours = Math.ceil(timeDiffMs / (1000 * 60 * 60));

                        if (hours > 3) {
                            // More than 3 hours = charge as 1 full day
                            updated.estimated_price = selectedBike.price;
                        } else if (hours > 0) {
                            // Hourly rate (daily price / 8)
                            const hourlyRate = Math.ceil(selectedBike.price / 8);
                            updated.estimated_price = hours * hourlyRate;
                        }
                    } else {
                        // Multi-day booking
                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                        if (days > 0) {
                            updated.estimated_price = days * selectedBike.price;
                        }
                    }
                }
            }

            return updated;
        });
    };

    // Get filtered bikes based on selected dealer
    const getFilteredBikes = () => {
        if (!formData.dealer_id) return bikes;
        return bikes.filter(bike => bike.dealer_id === Number(formData.dealer_id));
    };

    const handleUpdateBooking = async () => {
        setLoading(true);
        try {
            console.log("=== STARTING BOOKING UPDATE ===");
            console.log("Booking ID:", booking.id);
            console.log("Current booking status:", booking.status);
            console.log("Form data:", formData);

            // Enhanced validation before sending
            if (!formData.dealer_id || !formData.bike_id) {
                alert("Please select both dealer and bike");
                setLoading(false);
                return;
            }

            if (!formData.start_date || !formData.end_date) {
                alert("Please provide both start and end dates");
                setLoading(false);
                return;
            }

            // Validate bike belongs to dealer
            const selectedBike = bikes.find(bike => bike.id === Number(formData.bike_id));
            const selectedDealer = dealers.find(dealer => dealer.id === Number(formData.dealer_id));

            if (!selectedBike) {
                alert(`Error: Selected bike (ID: ${formData.bike_id}) not found in available bikes list`);
                setLoading(false);
                return;
            }

            if (!selectedDealer) {
                alert(`Error: Selected dealer (ID: ${formData.dealer_id}) not found in dealers list`);
                setLoading(false);
                return;
            }

            if (selectedBike.dealer_id !== Number(formData.dealer_id)) {
                alert(`Error: Bike "${selectedBike.model} - ${selectedBike.license_plate}" belongs to dealer ID ${selectedBike.dealer_id}, but you selected dealer ID ${formData.dealer_id} (${selectedDealer.name})`);
                setLoading(false);
                return;
            }

            // Validate dates
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);

            if (startDate >= endDate) {
                alert("End date must be after start date");
                setLoading(false);
                return;
            }

            // Check if dates are in the past (with some tolerance)
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            if (startDate < yesterday && booking.status === 'PENDING') {
                const confirmPastDate = confirm("Start date is in the past. Are you sure you want to proceed?");
                if (!confirmPastDate) {
                    setLoading(false);
                    return;
                }
            }

            // Safer date conversion with error handling
            let start_date_iso = null;
            let end_date_iso = null;

            try {
                if (formData.start_date) {
                    console.log("Converting start_date:", formData.start_date);
                    const startDate = new Date(formData.start_date);
                    if (isNaN(startDate.getTime())) {
                        throw new Error("Invalid start_date: " + formData.start_date);
                    }
                    start_date_iso = startDate.toISOString();
                    console.log("start_date converted to:", start_date_iso);
                }

                if (formData.end_date) {
                    console.log("Converting end_date:", formData.end_date);
                    const endDate = new Date(formData.end_date);
                    if (isNaN(endDate.getTime())) {
                        throw new Error("Invalid end_date: " + formData.end_date);
                    }
                    end_date_iso = endDate.toISOString();
                    console.log("end_date converted to:", end_date_iso);
                }
            } catch (dateError) {
                console.error("Date conversion error:", dateError);
                alert("Lỗi chuyển đổi ngày tháng: " + dateError.message);
                return;
            }

            const requestBody = {
                dealer_id: formData.dealer_id ? Number(formData.dealer_id) : null,
                bike_id: formData.bike_id ? Number(formData.bike_id) : null,
                // 👇 SỬA QUAN TRỌNG: Convert sang ISO String để tránh lỗi timezone
                // Local: '2026-01-15T03:10' -> Server hiểu UTC: '2026-01-15T03:10:00.000Z'
                start_date: start_date_iso,
                end_date: end_date_iso,
                pickup_location: formData.pickup_location || null,
                status: formData.status,
                estimated_price: formData.estimated_price ? Number(formData.estimated_price) : null,
            };

            console.log("=== UPDATING BOOKING ===");
            console.log("Booking ID:", booking.id);
            console.log("Form data raw:", JSON.stringify(formData, null, 2));
            console.log("Request body:", JSON.stringify(requestBody, null, 2));
            console.log("start_date conversion:", formData.start_date, "=>", requestBody.start_date);
            console.log("end_date conversion:", formData.end_date, "=>", requestBody.end_date);
            console.log("Selected bike info:", bikes.find(bike => bike.id === Number(formData.bike_id)));
            console.log("Selected dealer info:", dealers.find(dealer => dealer.id === Number(formData.dealer_id)));

            console.log("=== SENDING UPDATE REQUEST ===");
            console.log("URL:", `${process.env.REACT_APP_API_URL}booking-requests/${booking.id}`);
            console.log("Method: PUT");
            console.log("Headers: Content-Type: application/json, credentials: include");
            console.log("Request body:", JSON.stringify(requestBody, null, 2));

            // Test API connection first
            try {
                const testResponse = await fetch(
                    `${process.env.REACT_APP_API_URL}booking-requests/${booking.id}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                console.log("✅ GET test successful, status:", testResponse.status);

                if (!testResponse.ok) {
                    const testError = await testResponse.json();
                    console.error("❌ GET test failed:", testError);
                    alert(`Cannot access booking ${booking.id}. Status: ${testResponse.status}\nError: ${testError.message}`);
                    setLoading(false);
                    return;
                }
            } catch (testError) {
                console.error("❌ Connection test failed:", testError);
                alert(`Connection test failed: ${testError.message}\nPlease check your internet connection and try again.`);
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}booking-requests/${booking.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(requestBody),
                }
            );

            if (response.ok) {
                const responseData = await response.json();
                console.log("✅ Booking updated successfully!");
                console.log("Response data:", responseData);
                alert("Booking updated successfully!");
                onClose();
                onSuccess(); // Call onSuccess after closing to refresh the table
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (parseError) {
                    console.error("Could not parse error response as JSON:", parseError);
                    errorData = { message: "Could not parse server response" };
                }

                console.error("=== UPDATE BOOKING ERROR ===");
                console.error("Booking ID:", booking.id);
                console.error("Response status:", response.status);
                console.error("Response statusText:", response.statusText);
                console.error("Response headers:", Object.fromEntries(response.headers.entries()));
                console.error("Full error response:", errorData);
                console.error("Request body sent:", requestBody);
                console.error("Request URL:", `${process.env.REACT_APP_API_URL}booking-requests/${booking.id}`);

                // Detailed error message for user
                let errorMessage = `❌ Failed to update booking ID ${booking.id}\n`;
                errorMessage += `Status: ${response.status} ${response.statusText}\n`;
                errorMessage += `Message: ${errorData.message || "Unknown error"}\n`;

                if (errorData.details) {
                    errorMessage += `Details: ${JSON.stringify(errorData.details, null, 2)}\n`;
                }

                // Add debugging info for specific errors
                if (response.status === 500) {
                    errorMessage += `\n🔍 Debug Info:\n`;
                    errorMessage += `- Check if bike ${requestBody.bike_id} belongs to dealer ${requestBody.dealer_id}\n`;
                    errorMessage += `- Verify booking ${booking.id} exists and is editable\n`;
                    errorMessage += `- Check server logs for detailed error\n`;
                }

                alert(errorMessage);
            }
        } catch (error) {
            console.error("Error updating booking:", error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">
                        Update Booking Request - {booking?.id ? `BK${String(booking.id).padStart(6, '0')}` : ''}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
                </div>

                {/* Form Fields - Scrollable */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto bg-white">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Dealer */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Dealer
                            </label>
                            <select
                                name="dealer_id"
                                value={formData.dealer_id}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select a dealer</option>
                                {dealers.map((dealer) => (
                                    <option key={dealer.id} value={dealer.id}>
                                        {dealer.name} - {dealer.contact_phone}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bike */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Motorbike
                            </label>
                            <select
                                name="bike_id"
                                value={formData.bike_id}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!formData.dealer_id}
                            >
                                <option value="">{!formData.dealer_id ? "Select a dealer first" : "Select a bike"}</option>
                                {getFilteredBikes()
                                    .filter((b) => b.status === "available")
                                    .map((bike) => (
                                        <option key={bike.id} value={bike.id}>
                                            {bike.model} - {bike.license_plate} ({bike.price} VNĐ/day)
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="datetime-local"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                End Date
                            </label>
                            <input
                                type="datetime-local"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Pickup Location */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Pickup Location
                            </label>
                            <input
                                type="text"
                                name="pickup_location"
                                value={formData.pickup_location}
                                onChange={handleInputChange}
                                placeholder="Enter pickup location"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        {/* Estimated Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Estimated Price (VNĐ)
                            </label>
                            <input
                                type="number"
                                name="estimated_price"
                                value={formData.estimated_price}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Debug Info (only show in development) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
                        <details className="text-xs">
                            <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
                                🔍 Debug Info (Click to expand)
                            </summary>
                            <div className="mt-2 space-y-1 text-gray-500">
                                <div><strong>Booking ID:</strong> {booking?.id}</div>
                                <div><strong>Current Status:</strong> {booking?.status}</div>
                                <div><strong>Available Bikes for Dealer:</strong> {getFilteredBikes().length}</div>
                                <div><strong>Selected Bike:</strong> {formData.bike_id ? `${bikes.find(b => b.id === Number(formData.bike_id))?.model} (ID: ${formData.bike_id})` : 'None'}</div>
                                <div><strong>Selected Dealer:</strong> {formData.dealer_id ? `${dealers.find(d => d.id === Number(formData.dealer_id))?.name} (ID: ${formData.dealer_id})` : 'None'}</div>
                                <div><strong>API URL:</strong> {process.env.REACT_APP_API_URL}</div>
                                <div><strong>Date Range:</strong> {formData.start_date} → {formData.end_date}</div>
                            </div>
                        </details>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdateBooking}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateBookingRequestModal;
