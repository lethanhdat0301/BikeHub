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
    useToast,
    VStack,
} from "@chakra-ui/react";

interface UpdateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onSuccess: () => void;
}

const UpdateBookingModal: React.FC<UpdateBookingModalProps> = ({
    isOpen,
    onClose,
    booking,
    onSuccess,
}) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [bikes, setBikes] = useState<any[]>([]);

    // State cho form Create Rental
    const [formData, setFormData] = useState({
        user_id: "",
        bike_id: "",
        start_time: "",
        end_time: "",
        status: "pending",
        price: 0,
        qrcode: "",
        payment_id: "",
        order_id: "",
    });

    // Helper format date cho input datetime-local
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    useEffect(() => {
        if (isOpen && booking) {
            fetchBikes();

            // Auto-fill dữ liệu từ booking
            setFormData({
                user_id: booking.user_id || "",
                bike_id: "", // Cần chọn thủ công
                start_time: booking.start_date ? formatDateForInput(booking.start_date) : "",
                end_time: booking.end_date ? formatDateForInput(booking.end_date) : "",
                status: "pending",
                price: 0,
                qrcode: "",
                payment_id: "",
                order_id: `ORD-${booking.id}`,
            });
        }
    }, [isOpen, booking]);

    const fetchBikes = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}bikes`, {
                credentials: "include",
            });
            const data = await response.json();
            setBikes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching bikes:", error);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateRental = async () => {
        // Validate
        if (!formData.bike_id || !formData.start_time || !formData.end_time || !formData.price) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields (Motorbike, Time, Price)",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            // 1. Tạo Rental
            const rentalResponse = await fetch(
                `${process.env.REACT_APP_API_URL}rentals/rental`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        user_id: Number(formData.user_id),
                        bike_id: Number(formData.bike_id),
                        start_time: new Date(formData.start_time).toISOString(),
                        end_time: new Date(formData.end_time).toISOString(),
                        status: formData.status,
                        price: Number(formData.price),
                        qrcode: formData.qrcode,
                        payment_id: formData.payment_id,
                        order_id: formData.order_id,
                        contact_name: booking.name,
                        contact_phone: booking.contact_details,
                        pickup_location: booking.pickup_location,
                    }),
                }
            );

            if (rentalResponse.ok) {
                // Lấy thông tin bike để tìm dealer
                const selectedBike = bikes.find(b => b.id === Number(formData.bike_id));
                let dealerIdToAssign = null;

                // Nếu bike có dealer_id, tìm dealer record tương ứng
                if (selectedBike?.dealer_id) {
                    try {
                        const dealerResponse = await fetch(
                            `${process.env.REACT_APP_API_URL}dealers/user/${selectedBike.dealer_id}`,
                            { credentials: "include" }
                        );
                        if (dealerResponse.ok) {
                            const dealer = await dealerResponse.json();
                            if (dealer) {
                                dealerIdToAssign = dealer.id;
                            }
                        }
                    } catch (error) {
                        console.error("Error finding dealer:", error);
                    }
                }

                // 2. Cập nhật Booking Request thành COMPLETED và gán dealer_id
                const updateData = {
                    status: "COMPLETED",
                    admin_notes: `Converted to rental (Order: ${formData.order_id})`,
                    bike_id: Number(formData.bike_id),
                    ...(dealerIdToAssign && { dealer_id: dealerIdToAssign })
                };

                await fetch(
                    `${process.env.REACT_APP_API_URL}booking-requests/${booking.id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify(updateData),
                    }
                );

                toast({
                    title: "Success",
                    description: "Rental created successfully!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                onSuccess();
                onClose();
            } else {
                const errorData = await rentalResponse.json();
                throw new Error(errorData.message || "Failed to create rental");
            }
        } catch (error: any) {
            console.error("Error creating rental:", error);
            toast({
                title: "Error",
                description: error.message || "An error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent>
                <ModalHeader borderBottom="1px" borderColor="gray.200">
                    Create a new rental
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody py={6}>
                    <VStack spacing={4} align="stretch">
                        {/* User ID */}
                        <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">user_id</FormLabel>
                            <Input
                                name="user_id"
                                value={formData.user_id}
                                isReadOnly
                                bg="gray.50"
                            />
                        </FormControl>

                        {/* Bike Selection */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="gray.600">bike_id</FormLabel>
                            <Select
                                name="bike_id"
                                placeholder="Select a bike"
                                value={formData.bike_id}
                                onChange={handleInputChange}
                            >
                                {bikes
                                    .filter((b) => b.status === "available")
                                    .map((bike) => (
                                        <option key={bike.id} value={bike.id}>
                                            {bike.model} - {bike.license_plate} ({bike.price}VNĐ/day)
                                        </option>
                                    ))}
                            </Select>
                        </FormControl>

                        {/* Start Time */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="gray.600">start_time</FormLabel>
                            <Input
                                type="datetime-local"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleInputChange}
                            />
                        </FormControl>

                        {/* End Time */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="gray.600">end_time</FormLabel>
                            <Input
                                type="datetime-local"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleInputChange}
                            />
                        </FormControl>

                        {/* Status */}
                        <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">status</FormLabel>
                            <Input
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            />
                        </FormControl>

                        {/* Price */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="gray.600">price</FormLabel>
                            <Input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0"
                            />
                        </FormControl>

                        {/* QRCode */}
                        <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">qrcode</FormLabel>
                            <Input
                                name="qrcode"
                                value={formData.qrcode}
                                onChange={handleInputChange}
                            />
                        </FormControl>

                        {/* Payment ID */}
                        <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">payment_id</FormLabel>
                            <Input
                                name="payment_id"
                                value={formData.payment_id}
                                onChange={handleInputChange}
                            />
                        </FormControl>

                        {/* Order ID */}
                        <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">order_id</FormLabel>
                            <Input
                                name="order_id"
                                value={formData.order_id}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter borderTop="1px" borderColor="gray.200">
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleCreateRental}
                        isLoading={loading}
                        loadingText="Creating..."
                    >
                        Create
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UpdateBookingModal;