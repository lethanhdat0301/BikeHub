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

interface AddBikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddBikeModal: React.FC<AddBikeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [parks, setParks] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        model: "",
        status: "available",
        location: "",
        price: 0,
        park_id: "",
        image: "",
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                        ...formData,
                        park_id: parseInt(formData.park_id),
                        lock: false,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to add bike");
            }

            toast({
                title: "Bike Added Successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Reset form
            setFormData({
                model: "",
                status: "available",
                location: "",
                price: 0,
                park_id: "",
                image: "",
                description: "",
                dealer_name: "",
                dealer_contact: "",
                seats: 2,
                fuel_type: "gasoline",
                transmission: "manual",
            });

            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add bike",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent mx={4} my={4} maxH="85vh" bg="white" borderRadius="lg" boxShadow="xl">
                <ModalHeader fontSize="lg" fontWeight="600" borderBottom="1px" borderColor="gray.200" pb={3}>
                    Add New Bike
                </ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody pt={6} pb={6}>
                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                    Model*
                                </FormLabel>
                                <Input
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="e.g., Honda Wave 110i"
                                    fontSize="sm"
                                />
                            </FormControl>

                            <HStack width="100%" spacing={4}>
                                <FormControl isRequired flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                        Status*
                                    </FormLabel>
                                    <Select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        fontSize="sm"
                                    >
                                        <option value="available">Available</option>
                                        <option value="rented">Rented</option>
                                        <option value="maintenance">Maintenance</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                        Price/Day ($)*
                                    </FormLabel>
                                    <NumberInput
                                        value={formData.price}
                                        onChange={(_, val) => setFormData({ ...formData, price: val })}
                                        min={0}
                                    >
                                        <NumberInputField fontSize="sm" />
                                    </NumberInput>
                                </FormControl>
                            </HStack>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                    Park*
                                </FormLabel>
                                <Select
                                    value={formData.park_id}
                                    onChange={(e) => setFormData({ ...formData, park_id: e.target.value })}
                                    placeholder="Select a park"
                                    fontSize="sm"
                                >
                                    {parks.map((park) => (
                                        <option key={park.id} value={park.id}>
                                            {park.name} - {park.location}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                    Location*
                                </FormLabel>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Parking Slot A1"
                                    fontSize="sm"
                                />
                            </FormControl>

                            <HStack width="100%" spacing={4}>
                                <FormControl flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                        Seats
                                    </FormLabel>
                                    <NumberInput
                                        value={formData.seats}
                                        onChange={(_, val) => setFormData({ ...formData, seats: val })}
                                        min={1}
                                        max={4}
                                    >
                                        <NumberInputField fontSize="sm" />
                                    </NumberInput>
                                </FormControl>

                                <FormControl flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                        Fuel Type
                                    </FormLabel>
                                    <Select
                                        value={formData.fuel_type}
                                        onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                                        fontSize="sm"
                                    >
                                        <option value="gasoline">Gasoline</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </Select>
                                </FormControl>

                                <FormControl flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                        Transmission
                                    </FormLabel>
                                    <Select
                                        value={formData.transmission}
                                        onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                                        fontSize="sm"
                                    >
                                        <option value="manual">Manual</option>
                                        <option value="automatic">Automatic</option>
                                    </Select>
                                </FormControl>
                            </HStack>

                            <FormControl>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                    Image URL
                                </FormLabel>
                                <Input
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://example.com/bike-image.jpg"
                                    fontSize="sm"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                    Description
                                </FormLabel>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the bike features..."
                                    rows={3}
                                    fontSize="sm"
                                />
                            </FormControl>

                            <HStack width="100%" spacing={4}>
                                <FormControl flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                        Dealer Name
                                    </FormLabel>
                                    <Input
                                        value={formData.dealer_name}
                                        onChange={(e) => setFormData({ ...formData, dealer_name: e.target.value })}
                                        placeholder="Dealer or Shop Name"
                                        fontSize="sm"
                                    />
                                </FormControl>

                                <FormControl flex={1}>
                                    <FormLabel fontSize="sm" color="gray.600" mb={2}>
                                        Dealer Contact
                                    </FormLabel>
                                    <Input
                                        value={formData.dealer_contact}
                                        onChange={(e) => setFormData({ ...formData, dealer_contact: e.target.value })}
                                        placeholder="Phone or Email"
                                        fontSize="sm"
                                    />
                                </FormControl>
                            </HStack>
                        </VStack>
                    </ModalBody>

                    <ModalFooter borderTop="1px" borderColor="gray.200" pt={4}>
                        <Button variant="ghost" mr={3} onClick={onClose} fontSize="sm">
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            type="submit"
                            isLoading={loading}
                            fontSize="sm"
                        >
                            Create
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default AddBikeModal;
