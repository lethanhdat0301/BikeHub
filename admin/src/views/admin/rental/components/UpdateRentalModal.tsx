import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    rental: any;
    onSuccess: () => void;
};

const UpdateRentalModal: React.FC<Props> = ({ isOpen, onClose, rental, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [parks, setParks] = useState<any[]>([]);
    const [dealers, setDealers] = useState<any[]>([]);

    // State cho form cập nhật rental
    const [formData, setFormData] = useState({
        start_time: "",
        end_time: "",
        price: 0,
        status: "pending",
        transfer_park_id: "",
        transfer_dealer_id: "",
        current_location: "",
    });

    // Điền dữ liệu khi mở modal
    useEffect(() => {
        if (isOpen && rental) {
            setFormData({
                start_time: rental.start_time ? formatDateForInput(rental.start_time) : "",
                end_time: rental.end_time ? formatDateForInput(rental.end_time) : "",
                price: rental.price || 0,
                status: rental.status || "pending",
                transfer_park_id: "",
                transfer_dealer_id: "",
                current_location: rental.Bike?.location || "",
            });

            // Fetch parks and dealers for dropdowns
            fetchParksAndDealers();
        }
    }, [isOpen, rental]);

    const fetchParksAndDealers = async () => {
        try {
            const [parksResponse, dealersResponse] = await Promise.all([
                fetch(`${process.env.REACT_APP_API_URL}parks`, { credentials: "include" }),
                fetch(`${process.env.REACT_APP_API_URL}dealers`, { credentials: "include" })
            ]);

            const parksData = await parksResponse.json();
            const dealersData = await dealersResponse.json();

            setParks(Array.isArray(parksData) ? parksData : []);
            setDealers(Array.isArray(dealersData) ? dealersData : []);
        } catch (error) {
            console.error("Error fetching parks and dealers:", error);
        }
    };

    // Helper để format date sang yyyy-MM-ddThh:mm (cho input datetime-local)
    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateRental = async () => {
        setLoading(true);
        try {
            const updateData: any = {
                user_id: rental.user_id,
                bike_id: rental.bike_id,
                start_time: formData.start_time ? new Date(formData.start_time).toISOString() : undefined,
                end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined,
                price: formData.price ? Number(formData.price) : undefined,
                status: formData.status,
                qrcode: rental.qrcode || "",
                payment_id: rental.payment_id || "",
                order_id: rental.order_id || "",
                // Add new fields
                current_location: formData.current_location || "",
            };

            // Add transfer information if provided
            if (formData.transfer_park_id) {
                updateData.transfer_park_id = Number(formData.transfer_park_id);
            }
            if (formData.transfer_dealer_id) {
                updateData.transfer_dealer_id = Number(formData.transfer_dealer_id);
            }

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}rentals/rental/${rental.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(updateData),
                }
            );

            if (response.ok) {
                alert("Rental updated successfully!");
                onClose();
                onSuccess(); // Refresh table
            } else {
                const errorData = await response.json();
                alert(`Failed to update rental: ${errorData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating rental:", error);
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
                        Update Rental - {rental?.booking_code || (rental.id ? `BK${String(rental.id).padStart(6, '0')}` : '')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
                </div>

                {/* Customer Info - Read Only */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="text-base font-semibold text-gray-800">
                                {rental?.User?.name || rental?.contact_name || 'Guest'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Bike</p>
                            <p className="text-base font-semibold text-gray-800">
                                {rental?.Bike?.model || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Current Park</p>
                            <p className="text-base font-semibold text-gray-800">
                                {rental?.Bike?.Park?.name || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Fields - Scrollable */}
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto bg-white">
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    End Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Price ($)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    step="0.01"
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
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Transfer Section */}
                        <div className="border-t pt-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Transfer Rental (Optional)</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Use this section when customer made a mistake and needs to transfer to different location or dealer.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Transfer to Park */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Transfer to Park
                                    </label>
                                    <select
                                        name="transfer_park_id"
                                        value={formData.transfer_park_id}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">No Transfer</option>
                                        {parks.map((park) => (
                                            <option key={park.id} value={park.id}>
                                                {park.name} - {park.location}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Transfer to Dealer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Transfer to Dealer
                                    </label>
                                    <select
                                        name="transfer_dealer_id"
                                        value={formData.transfer_dealer_id}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">No Transfer</option>
                                        {dealers.map((dealer) => (
                                            <option key={dealer.id} value={dealer.id}>
                                                {dealer.name} - {dealer.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Current Location */}
                        <div className="border-t pt-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Current Location</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Where is the motorbike now?
                                </label>
                                <textarea
                                    name="current_location"
                                    value={formData.current_location}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Enter current location or address where motorbike is located..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This helps track motorbike location especially when rental is completed or in progress.
                                </p>
                            </div>
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
                        onClick={handleUpdateRental}
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

export default UpdateRentalModal;
