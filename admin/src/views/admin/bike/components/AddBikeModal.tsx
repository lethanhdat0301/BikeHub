import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

interface AddBikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddBikeModal: React.FC<AddBikeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [parks, setParks] = useState<any[]>([]);
    const [dealers, setDealers] = useState<any[]>([]);

    type BikeFormData = {
        model: string;
        status: string;
        location: string;
        price: string;
        park_id: string;
        dealer_id: string;
        image: string;
        image_preview?: string;
        description: string;
        dealer_name: string;
        dealer_contact: string;
        seats: string;
        fuel_type: string;
        transmission: string;
    };

    const [formData, setFormData] = useState<BikeFormData>({
        model: "",
        status: "available",
        location: "",
        price: "",
        park_id: "",
        dealer_id: "",
        image: "",
        image_preview: undefined,
        description: "",
        dealer_name: "",
        dealer_contact: "",
        seats: "2",
        fuel_type: "gasoline",
        transmission: "manual",
    });

    useEffect(() => {
        if (isOpen) {
            fetchParks();
            fetchDealers();
            // Reset form when opening
            setFormData({
                model: "",
                status: "available",
                location: "",
                price: "",
                park_id: "",
                dealer_id: "",
                image: "",
                description: "",
                dealer_name: "",
                dealer_contact: "",
                seats: "2",
                fuel_type: "gasoline",
                transmission: "manual",
            });
        }
    }, [isOpen]);

    const fetchParks = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}parks`,
                { credentials: "include" }
            );
            const data = await response.json();
            setParks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching parks:", error);
        }
    };

    const fetchDealers = async () => {
        try {
            // console.log('Fetching dealers from:', `${process.env.REACT_APP_API_URL}users/dealers`);
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}users/dealers`,
                { credentials: "include" }
            );
            // console.log('Dealers response status:', response.status);
            const data = await response.json();
            // console.log('Dealers data received:', data);
            setDealers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching dealers:", error);
            setDealers([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.model || !formData.price || !formData.park_id || !formData.location) {
            alert("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}bikes/bike`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        model: formData.model,
                        status: formData.status,
                        location: formData.location,
                        price: parseFloat(formData.price),
                        park_id: parseInt(formData.park_id),
                        dealer_id: formData.dealer_id ? parseInt(formData.dealer_id) : null,
                        image: formData.image || "",
                        description: formData.description || "",
                        dealer_name: formData.dealer_name || "",
                        dealer_contact: formData.dealer_contact || "",
                        seats: parseInt(formData.seats),
                        fuel_type: formData.fuel_type,
                        transmission: formData.transmission,
                        lock: false,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to add motorbike");
            }

            alert("Motorbike added successfully!");
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(error.message || "Failed to add bike");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">
                        Add New Motorbikes
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
                </div>

                {/* Form Fields - Scrollable */}
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto bg-white">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Model */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Model *
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Honda Wave 110i, Yamaha Exciter 155"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Park */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Park *
                                </label>
                                <select
                                    name="park_id"
                                    value={formData.park_id}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a park</option>
                                    {parks.map((park) => (
                                        <option key={park.id} value={park.id}>
                                            {park.name} - {park.location}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Location */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Location (Parking Slot) *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Parking Slot A1, Zone B-15"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Dealer */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Dealer (Optional) {dealers.length > 0 && `(${dealers.length} available)`}
                                </label>
                                <select
                                    name="dealer_id"
                                    value={formData.dealer_id}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">
                                        {dealers.length === 0 ? "No dealers available" : "Select a dealer (optional)"}
                                    </option>
                                    {dealers.map((dealer) => (
                                        <option key={dealer.id} value={dealer.id}>
                                            {dealer.name} - {dealer.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Status *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="available">Available</option>
                                    <option value="rented">Rented</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Price per Day (VNĐ) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Transmission */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Transmission *
                                </label>
                                <select
                                    name="transmission"
                                    value={formData.transmission}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="manual">Manual</option>
                                    <option value="automatic">Automatic</option>
                                </select>
                            </div>

                            {/* Fuel Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Fuel Type *
                                </label>
                                <select
                                    name="fuel_type"
                                    value={formData.fuel_type}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="gasoline">Gasoline</option>
                                    <option value="electric">Electric</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            {/* Seats */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Seats *
                                </label>
                                <input
                                    type="number"
                                    name="seats"
                                    value={formData.seats}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="4"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Dealer Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Dealer Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="dealer_name"
                                    value={formData.dealer_name}
                                    onChange={handleInputChange}
                                    placeholder="Shop or Dealer Name"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Dealer Contact */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Dealer Contact (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="dealer_contact"
                                    value={formData.dealer_contact}
                                    onChange={handleInputChange}
                                    placeholder="Phone or Email"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files && e.target.files[0];
                                        if (!file) return;
                                        try {
                                            const fd = new FormData();
                                            fd.append('file', file);
                                            const res = await fetch(`${process.env.REACT_APP_API_URL}uploads/image`, {
                                                method: 'POST',
                                                body: fd,
                                                credentials: 'include',
                                            });
                                            const payload = await res.json();
                                            if (!res.ok) throw new Error(payload?.message || 'Upload failed');
                                            setFormData({ ...formData, image: payload.name || payload.url, image_preview: payload.url || (payload.name ? `${process.env.REACT_APP_API_URL}uploads/image/${encodeURIComponent(payload.name)}` : undefined) });
                                        } catch (err) {
                                            console.error('Upload failed', err);
                                            alert('Upload failed');
                                        }
                                    }}
                                />
                                {formData.image_preview || (formData.image && formData.image.startsWith('http') ? formData.image : null) ? (
                                    <div className="mt-2 h-24 w-32 overflow-hidden rounded bg-gray-100">
                                        <img src={formData.image_preview || formData.image} className="h-full w-full object-cover" alt="preview" />
                                    </div>
                                ) : null}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the motorbike features, condition, etc..."
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBikeModal;
