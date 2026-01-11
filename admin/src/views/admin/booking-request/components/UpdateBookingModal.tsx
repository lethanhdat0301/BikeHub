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
            console.log('Dealers fetched:', data);
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
                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    if (days > 0) {
                        updated.estimated_price = days * selectedBike.price;
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
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}booking-requests/${booking.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        dealer_id: formData.dealer_id ? Number(formData.dealer_id) : null,
                        bike_id: formData.bike_id ? Number(formData.bike_id) : null,
                        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
                        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
                        pickup_location: formData.pickup_location || undefined,
                        status: formData.status,
                        estimated_price: formData.estimated_price ? Number(formData.estimated_price) : undefined,
                    }),
                }
            );

            if (response.ok) {
                alert("Booking updated successfully!");
                onClose();
                onSuccess(); // Call onSuccess after closing to refresh the table
            } else {
                const errorData = await response.json();
                alert(`Failed to update booking: ${errorData.message || "Unknown error"}`);
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
                                            {bike.model} - {bike.license_plate} (${bike.price}/day)
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
                                Estimated Price ($)
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
