import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

const CreateBookingModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    // State cho form tạo booking mới
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact_method: "phone",
        contact_details: "",
        pickup_location: "",
        admin_notes: "",
    });

    // Reset form khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: "",
                email: "",
                contact_method: "phone",
                contact_details: "",
                pickup_location: "",
                admin_notes: "",
            });
        }
    }, [isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateBooking = async () => {
        // Validate
        if (!formData.name.trim() || !formData.contact_details.trim() || !formData.pickup_location.trim()) {
            alert("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}booking-requests/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email || null,
                        contact_method: formData.contact_method,
                        contact_details: formData.contact_details,
                        pickup_location: formData.pickup_location,
                        // Note: admin_notes sẽ được cập nhật sau nếu cần
                    }),
                }
            );

            if (response.ok) {
                const result = await response.json();
                alert(`Booking request created successfully! ID: ${result.bookingId}`);
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create booking");
            }
        } catch (error: any) {
            console.error("Error creating booking:", error);
            alert("An error occurred: " + error.message);
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
                    <h2 className="text-xl font-bold text-gray-800">Create New Booking Request</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
                </div>

                {/* Form Fields - Scrollable */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto bg-white">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter customer name"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Email (Optional)
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Contact Method */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Contact Method *
                            </label>
                            <select
                                name="contact_method"
                                value={formData.contact_method}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="phone">Phone</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="telegram">Telegram</option>
                                <option value="email">Email</option>
                            </select>
                        </div>

                        {/* Contact Details */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Contact Details *
                            </label>
                            <input
                                type="text"
                                name="contact_details"
                                value={formData.contact_details}
                                onChange={handleInputChange}
                                placeholder={
                                    formData.contact_method === "phone"
                                        ? "Enter phone number"
                                        : formData.contact_method === "email"
                                            ? "Enter email address"
                                            : `Enter ${formData.contact_method} details`
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Pickup Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Pickup Location *
                            </label>
                            <input
                                type="text"
                                name="pickup_location"
                                value={formData.pickup_location}
                                onChange={handleInputChange}
                                placeholder="Enter pickup location"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Admin Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                name="admin_notes"
                                value={formData.admin_notes}
                                onChange={handleInputChange}
                                placeholder="Add any admin notes..."
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateBooking}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating..." : "Create Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateBookingModal;