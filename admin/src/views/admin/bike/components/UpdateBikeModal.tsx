import React, { useState, useEffect } from "react";
import {
    useToast,
} from "@chakra-ui/react";
import { MdClose } from "react-icons/md";

interface UpdateBikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    bikeId: number | null;
    onSuccess: () => void;
}

const UpdateBikeModal: React.FC<UpdateBikeModalProps> = ({ isOpen, onClose, bikeId, onSuccess }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [parks, setParks] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        model: "",
        status: "available",
        location: "",
        price: 0,
        park_id: "",
        image: "",
        image_preview: undefined,
        description: "",
        dealer_name: "",
        dealer_contact: "",
        seats: 2,
        fuel_type: "gasoline",
        transmission: "manual",
        license_plate: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetchParks();
            if (bikeId) fetchBike();
        }
    }, [isOpen, bikeId]);

    const fetchParks = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}parks`, { credentials: 'include' });
            const data = await response.json();
            setParks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch parks', err);
        }
    };

    const fetchBike = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}bikes/bike/${bikeId}`);
            if (!res.ok) throw new Error('Failed to load bike');
            const data = await res.json();
            setFormData({ ...data, park_id: data.park_id?.toString(), image_preview: data.image && data.image.startsWith('http') ? data.image : undefined });

            // If image is a stored key, request signed url
            if (data.image && typeof data.image === 'string' && !data.image.startsWith('http')) {
                try {
                    const r = await fetch(`${process.env.REACT_APP_API_URL}uploads/image/${encodeURIComponent(data.image)}`);
                    if (r.ok) {
                        const p = await r.json();
                        setFormData((prev: any) => ({ ...prev, image_preview: p.url }));
                    }
                } catch (e) {
                    // ignore
                }
            }
        } catch (err) {
            console.error('Fetch bike failed', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bikeId) return;
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}bikes/bike/${bikeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    park_id: formData.park_id ? parseInt(formData.park_id) : undefined,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to update bike');
            }

            toast({ title: 'Bike updated', status: 'success' });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to update', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" style={{ display: isOpen ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">
                        Edit Motorbike
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
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="e.g., Honda Wave 110i"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Status & Price */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Status *
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="available">Available</option>
                                    <option value="rented">Rented</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Price/Day (VNĐ) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    min={0}
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
                                    value={formData.park_id}
                                    onChange={(e) => setFormData({ ...formData, park_id: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a park</option>
                                    {parks.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} - {p.location}
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
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Parking Slot A1"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* License Plate */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    License Plate (Biển số xe)
                                </label>
                                <input
                                    type="text"
                                    value={formData.license_plate || ""}
                                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                                    placeholder="e.g., 29A-12345"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Seats & Fuel Type */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Seats
                                </label>
                                <input
                                    type="number"
                                    value={formData.seats}
                                    onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                                    min={1}
                                    max={3}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Fuel Type
                                </label>
                                <select
                                    value={formData.fuel_type}
                                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="gasoline">Gasoline</option>
                                    <option value="electric">Electric</option>
                                </select>
                            </div>

                            {/* Transmission */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Transmission
                                </label>
                                <select
                                    value={formData.transmission}
                                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="manual">Manual</option>
                                    <option value="automatic">Automatic</option>
                                </select>
                            </div>

                            {/* Dealer Name & Contact */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Dealer Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.dealer_name || ""}
                                    onChange={(e) => setFormData({ ...formData, dealer_name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Dealer Contact
                                </label>
                                <input
                                    type="text"
                                    value={formData.dealer_contact || ""}
                                    onChange={(e) => setFormData({ ...formData, dealer_contact: e.target.value })}
                                    placeholder="Phone number"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files && e.target.files[0];
                                        if (!file) return;
                                        try {
                                            const fd = new FormData();
                                            fd.append('file', file);
                                            const res = await fetch(`${process.env.REACT_APP_API_URL}uploads/image`, { method: 'POST', body: fd, credentials: 'include' });
                                            const payload = await res.json();
                                            if (!res.ok) throw new Error(payload?.message || 'Upload failed');
                                            setFormData({ ...formData, image: payload.name || payload.url, image_preview: payload.url || (payload.name ? `${process.env.REACT_APP_API_URL}uploads/image/${encodeURIComponent(payload.name)}` : undefined) });
                                        } catch (err) {
                                            console.error('Upload failed', err);
                                            toast({ title: 'Upload failed', status: 'error' });
                                        }
                                    }}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {formData.image_preview || (formData.image && formData.image.startsWith('http') ? formData.image : null) ? (
                                    <div className="mt-2 h-32 w-48 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                                        <img src={formData.image_preview || formData.image} className="h-full w-full object-cover" alt="preview" />
                                    </div>
                                ) : null}
                            </div>

                            {/* Description */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Enter motorbike description..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateBikeModal;