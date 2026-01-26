import React, { useState } from "react";
import { MdClose, MdLocationOn, MdImage, MdBusiness } from "react-icons/md";

interface CreateParkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateParkModal: React.FC<CreateParkModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        image: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.location) {
            alert("Name and location are required");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}parks/park`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to create park");
            }

            alert("Park created successfully!");

            // Reset form
            setFormData({ name: "", location: "", image: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(`Error: ${err.message || "Failed to create park"}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MdBusiness className="h-6 w-6" />
                        Create New Park
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
                </div>

                {/* Info Banner */}
                <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                    <p className="text-sm text-green-800">
                        📍 Add a new parking location for motorbikes. Fill in the required fields below.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
                        {/* Park Name */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <MdBusiness className="h-4 w-4 text-green-600" />
                                Park Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter park name (e.g., Central Station Park)"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <MdLocationOn className="h-4 w-4 text-green-600" />
                                Location Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Enter complete address with city"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                                required
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <MdImage className="h-4 w-4 text-green-600" />
                                Image URL (Optional)
                            </label>
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/park-image.jpg"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                            />
                            {formData.image && (
                                <div className="mt-3 h-32 w-full overflow-hidden rounded-lg bg-gray-100 border border-gray-300">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
                        >
                            {loading ? "Creating..." : "Create Park"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateParkModal;
