import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    NumberInput,
    NumberInputField,
    Textarea,
    useToast,
    VStack,
    HStack,
} from "@chakra-ui/react";

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
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent mx={4} my={4} maxH="85vh" bg="white" borderRadius="lg" boxShadow="xl">
                <ModalHeader fontSize="lg" fontWeight="600" borderBottom="1px" borderColor="gray.200" pb={3}>
                    Edit Bike
                </ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody pt={6} pb={6}>
                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>Model*</FormLabel>
                                <Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} fontSize="sm" />
                            </FormControl>

                            <HStack width="100%" spacing={4}>
                                <FormControl isRequired flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>Status*</FormLabel>
                                    <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} fontSize="sm">
                                        <option value="available">Available</option>
                                        <option value="rented">Rented</option>
                                        <option value="maintenance">Maintenance</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>Price/Day ($)*</FormLabel>
                                    <NumberInput value={formData.price} onChange={(_, val) => setFormData({ ...formData, price: val })} min={0}>
                                        <NumberInputField fontSize="sm" />
                                    </NumberInput>
                                </FormControl>
                            </HStack>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>Park*</FormLabel>
                                <Select value={formData.park_id} onChange={(e) => setFormData({ ...formData, park_id: e.target.value })} placeholder="Select a park" fontSize="sm">
                                    {parks.map(p => <option key={p.id} value={p.id}>{p.name} - {p.location}</option>)}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>Location*</FormLabel>
                                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} fontSize="sm" />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>Image</FormLabel>
                                <input type="file" accept="image/*" onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                                }} />
                                {formData.image_preview || (formData.image && formData.image.startsWith('http') ? formData.image : null) ? (
                                    <div className="mt-2 h-24 w-32 overflow-hidden rounded bg-gray-100">
                                        <img src={formData.image_preview || formData.image} className="h-full w-full object-cover" alt="preview" />
                                    </div>
                                ) : null}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>Description</FormLabel>
                                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} fontSize="sm" />
                            </FormControl>

                        </VStack>
                    </ModalBody>

                    <ModalFooter borderTop="1px" borderColor="gray.200" pt={4}>
                        <Button variant="ghost" mr={3} onClick={onClose} fontSize="sm">Cancel</Button>
                        <Button colorScheme="blue" type="submit" isLoading={loading} fontSize="sm">Save</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default UpdateBikeModal;