import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import bookingRequestService from "../../../../services/bookingRequestService";

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
    const [showPastDateConfirm, setShowPastDateConfirm] = useState(false);

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

    // 🔧 FIX: Helper để format date sang yyyy-MM-ddThh:mm KHÔNG chuyển đổi timezone
    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        // Lấy thời gian địa phương để tránh lệch timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const fetchBikes = async () => {
        try {
            // Get token for authentication
            const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("user_token");
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}bikes`, {
                credentials: "include",
                headers,
            });
            const data = await response.json();
            setBikes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching motorbikes:", error);
        }
    };

    const fetchDealers = async () => {
        try {
            // Get token for authentication
            const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("user_token");
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}users/dealers`, {
                credentials: "include",
                headers,
            });
            const data = await response.json();
            setDealers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching dealers:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            // 🔧 FIX: Reset bike_id when dealer changes to prevent mismatched pairs
            if (name === 'dealer_id') {
                updated.bike_id = ""; // Reset bike selection
                updated.estimated_price = 0; // Reset price
                return updated;
            }

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

    const performUpdate = async () => {
        try {
            // Safer date conversion with error handling
            let start_date_iso = null;
            let end_date_iso = null;

            try {
                if (formData.start_date) {
                    const startDate = new Date(formData.start_date);
                    if (isNaN(startDate.getTime())) {
                        throw new Error("Invalid start_date: " + formData.start_date);
                    }
                    start_date_iso = startDate.toISOString();
                }

                if (formData.end_date) {
                    const endDate = new Date(formData.end_date);
                    if (isNaN(endDate.getTime())) {
                        throw new Error("Invalid end_date: " + formData.end_date);
                    }
                    end_date_iso = endDate.toISOString();
                }
            } catch (dateError) {
                console.error("Date conversion error:", dateError);
                const errorMessage = dateError instanceof Error ? dateError.message : String(dateError);
                alert("Lỗi chuyển đổi ngày tháng: " + errorMessage);
                return;
            }

            const requestBody = {
                dealer_id: formData.dealer_id ? Number(formData.dealer_id) : null,
                bike_id: formData.bike_id ? Number(formData.bike_id) : null,
                start_date: start_date_iso,
                end_date: end_date_iso,
                pickup_location: formData.pickup_location || null,
                status: formData.status,
                estimated_price: formData.estimated_price ? Number(formData.estimated_price) : null,
            };

            console.log("=== UPDATING BOOKING ===");
            console.log("Booking ID:", booking.id);
            console.log("Request body:", JSON.stringify(requestBody, null, 2));
            console.log("API URL from env:", process.env.REACT_APP_API_URL);
            console.log("Service URL will be:", process.env.REACT_APP_API_URL || "http://localhost:3300/api/v1/");

            // 🔧 FIX: Use proper authentication via service instead of raw fetch
            const response = await bookingRequestService.updateBookingRequest(booking.id, requestBody);

            console.log("✅ Booking updated successfully!");
            console.log("Response data:", response);
            alert("Booking updated successfully!");
            onClose();
            onSuccess();
        } catch (error) {
            console.error("=== UPDATE BOOKING ERROR ===");
            console.error("Error updating booking:", error);
            console.error("Error type:", typeof error);
            console.error("Error constructor:", error?.constructor?.name);

            // Handle different error types from axios/service
            let errorMessage = "An error occurred while updating booking";

            if (error && typeof error === 'object') {
                if ('response' in error && error.response) {
                    // Axios error with response
                    const axiosError = error as any;
                    const status = axiosError.response?.status;
                    const data = axiosError.response?.data;

                    console.error("Axios response error:", {
                        status,
                        data,
                        headers: axiosError.response?.headers,
                        config: axiosError.config
                    });

                    errorMessage = `❌ Failed to update booking\nStatus: ${status}\nMessage: ${data?.message || "Unknown error"}`;

                    if (status === 500) {
                        errorMessage += `\n\n🔍 Debug Info:\n- Check if bike belongs to selected dealer\n- Verify booking exists and is editable\n- Check server logs for detailed error`;
                    }
                } else if ('code' in error && error.code === 'ERR_NETWORK') {
                    // Network error
                    const networkError = error as any;
                    console.error("Network error details:", {
                        message: networkError.message,
                        code: networkError.code,
                        config: networkError.config
                    });
                    errorMessage = `❌ Network Error: Cannot connect to server\n\nPossible causes:\n- API server is not running\n- Wrong API URL: ${process.env.REACT_APP_API_URL}\n- CORS issues\n- Internet connection problems\n\nPlease check if the API server is running and accessible.`;
                } else if ('message' in error) {
                    // Regular Error object
                    errorMessage = `❌ Error: ${error.message}`;
                }
            }

            alert(errorMessage);
        }
    };

    const handleUpdateBooking = async () => {
        setLoading(true);
        try {
            // Enhanced validation before sending
            if (!formData.dealer_id || !formData.bike_id) {
                alert("Please select both dealer and bike");
                return;
            }

            if (!formData.start_date || !formData.end_date) {
                alert("Please provide both start and end dates");
                return;
            }

            // Validate bike belongs to dealer
            const selectedBike = bikes.find(bike => bike.id === Number(formData.bike_id));
            const selectedDealer = dealers.find(dealer => dealer.id === Number(formData.dealer_id));

            if (!selectedBike || !selectedDealer) {
                alert("Error: Selected bike or dealer not found");
                return;
            }

            if (selectedBike.dealer_id !== Number(formData.dealer_id)) {
                alert(`Error: Bike "${selectedBike.model}" does not belong to selected dealer "${selectedDealer.name}"`);
                return;
            }

            // Validate dates
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);

            if (startDate >= endDate) {
                alert("End date must be after start date");
                return;
            }

            // Check if dates are in the past
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            if (startDate < yesterday && booking.status === 'PENDING') {
                setShowPastDateConfirm(true);
                return;
            }

            await performUpdate();
        } catch (error) {
            console.error("Error in handleUpdateBooking:", error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handlePastDateConfirm = async () => {
        setShowPastDateConfirm(false);
        setLoading(true);
        await performUpdate();
        setLoading(false);
    };

    const handlePastDateCancel = () => {
        setShowPastDateConfirm(false);
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

                {/* Form Fields */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto bg-white">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Dealer */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Dealer</label>
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
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Motorbike</label>
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

                        {/* Dates */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Start Date</label>
                            <input
                                type="datetime-local"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">End Date</label>
                            <input
                                type="datetime-local"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Pickup Location */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Pickup Location</label>
                            <input
                                type="text"
                                name="pickup_location"
                                value={formData.pickup_location}
                                onChange={handleInputChange}
                                placeholder="Enter pickup location"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status & Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Estimated Price (VNĐ)</label>
                            <input
                                type="number"
                                name="estimated_price"
                                value={formData.estimated_price}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Past Date Confirmation Modal */}
                {showPastDateConfirm && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 rounded-xl">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">⚠️ Past Date Warning</h3>
                            <p className="text-gray-600 mb-4">
                                The start date is in the past. Are you sure you want to proceed?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handlePastDateCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePastDateConfirm}
                                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                                >
                                    Proceed Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdateBooking}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateBookingRequestModal;
