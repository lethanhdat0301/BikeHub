import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    rental: any;
    onSuccess: () => void;
};

const DealerUpdateRentalModal: React.FC<Props> = ({ isOpen, onClose, rental, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    // State cho form cập nhật rental - chỉ cần status và location cho dealer
    const [formData, setFormData] = useState({
        status: "pending",
        current_location: "",
    });

    // Điền dữ liệu khi mở modal
    useEffect(() => {
        if (isOpen && rental) {
            setFormData({
                status: rental.status || "pending",
                current_location: rental.Bike?.location || "",
            });
        }
    }, [isOpen, rental]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateRental = async () => {
        setLoading(true);
        try {
            // Chỉ cập nhật status và location cho dealer
            const updateData = {
                status: formData.status,
                current_location: formData.current_location || "",
            };

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
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">
                        Update Rental Status & Location
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
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rental ID:</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {rental?.booking_code || (rental?.id ? `BK${String(rental.id).padStart(6, '0')}` : '')}                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Customer:</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {rental?.User?.name || rental?.contact_name || 'Guest'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Bike Model:</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {rental?.Bike?.model || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Fields - Simplified for dealer use */}
                <div className="px-6 py-6 bg-white">
                    <div className="space-y-6">
                        {/* Rental Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Rental Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="pending">Pending - Waiting for customer pickup</option>
                                <option value="active">Active - Customer has the motorbike</option>
                                <option value="completed">Completed - Motorbike returned successfully</option>
                                <option value="cancelled">Cancelled - Rental cancelled</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Update status when customer picks up, returns, or cancels rental
                            </p>
                        </div>

                        {/* Current Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Current Motorbike Location
                            </label>
                            <textarea
                                name="current_location"
                                value={formData.current_location}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Enter current location or address where bike is located..."
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Keep track of motorbike location for pickup/return coordination
                            </p>
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
                        {loading ? "Updating..." : "Update Status & Location"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DealerUpdateRentalModal;