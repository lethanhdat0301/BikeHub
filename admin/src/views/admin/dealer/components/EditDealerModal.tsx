import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    dealer: any;
    onSuccess: () => void;
};

const EditDealerModal: React.FC<Props> = ({ isOpen, onClose, dealer, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        telegram: "",
        location: "",
        status: "Active",
        image: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dealer) {
            setFormData({
                name: dealer.name || "",
                email: dealer.email || "",
                phone: dealer.phone || "",
                telegram: dealer.telegram || "",
                location: dealer.location || "",
                status: dealer.status || "Active",
                image: dealer.image || "",
            });
        }
    }, [dealer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}dealers/${dealer.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                alert("Dealer updated successfully!");
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                alert(`Failed to update dealer: ${error.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating dealer:", error);
            alert("An error occurred while updating the dealer");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-800">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                    <MdClose className="h-6 w-6" />
                </button>

                <h2 className="mb-6 text-2xl font-bold text-navy-700 dark:text-white">
                    Edit Dealer
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                            Phone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                            Telegram
                        </label>
                        <input
                            type="text"
                            name="telegram"
                            value={formData.telegram}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                            Status *
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                            Image URL
                        </label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Update Dealer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDealerModal;
