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
    Text
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
    const [dealers, setDealers] = useState<any[]>([]);
    const [allBikes, setAllBikes] = useState<any[]>([]);
    const [filteredBikes, setFilteredBikes] = useState<any[]>([]);

    // State cho form Create Rental
    const [formData, setFormData] = useState({
        user_id: "",
        dealer_id: "",
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
            fetchDealers();
            fetchBikes();

            // Auto-fill dữ liệu từ booking
            setFormData({
                user_id: booking.user_id || "",
                dealer_id: "",
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

    useEffect(() => {
        if (formData.dealer_id) {
            // Chỉ hiện xe thuộc Dealer đã chọn và đang available
            const bikesForDealer = allBikes.filter(
                b => b.dealer_id === Number(formData.dealer_id) && b.status === 'available'
            );
            setFilteredBikes(bikesForDealer);
        } else {
            setFilteredBikes([]);
        }
    }, [formData.dealer_id, allBikes]);

    const fetchDealers = async () => {
        try {
            // Giả sử API trả về list dealers
            const res = await fetch(`${process.env.REACT_APP_API_URL}dealers`, { credentials: "include" });
            const data = await res.json();
            setDealers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching dealers:", error);
        }
    };

    const fetchBikes = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}bikes`, { credentials: "include" });
            const data = await res.json();
            setAllBikes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching bikes:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Nếu thay đổi dealer -> reset bike_id
        if (name === 'dealer_id') {
            setFormData(prev => ({ ...prev, dealer_id: value, bike_id: "" }));
        }
    };

    const handleCreateRental = async () => {
        // Validation chặt chẽ
        if (!formData.dealer_id || !formData.bike_id || !formData.start_time || !formData.end_time) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng chọn Dealer, Xe và Thời gian", status: "warning" });
            return;
        }

        setLoading(true);
        try {
            // === BƯỚC 1: TẠO RENTAL (Có Dealer ID đàng hoàng) ===
            const rentalPayload = {
                user_id: Number(formData.user_id),
                bike_id: Number(formData.bike_id),
                dealer_id: Number(formData.dealer_id), // 🔥 QUAN TRỌNG: Gửi dealer_id explicit
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString(),
                status: formData.status,
                price: Number(formData.price),
                qrcode: formData.qrcode,
                order_id: formData.order_id,
                // Fallback contact info
                contact_name: booking.name,
                contact_phone: booking.contact_details,
                pickup_location: booking.pickup_location,
                booking_request_id: booking.id, // Link ngược lại booking luôn cho chắc
                booking_code: booking.booking_code // Mang mã code sang
            };

            const rentalResponse = await fetch(`${process.env.REACT_APP_API_URL}rentals/rental`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(rentalPayload),
            });

            if (!rentalResponse.ok) {
                const err = await rentalResponse.json();
                throw new Error(err.message || "Failed to create rental");
            }

            // === BƯỚC 2: UPDATE BOOKING REQUEST (Hoàn tất quy trình) ===
            const bookingPayload = {
                status: "COMPLETED",
                admin_notes: `Converted to rental (Order: ${formData.order_id})`,
                bike_id: Number(formData.bike_id),
                dealer_id: Number(formData.dealer_id) // 🔥 ĐỒNG BỘ: Update đúng dealer vừa chọn
            };

            await fetch(`${process.env.REACT_APP_API_URL}booking-requests/${booking.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(bookingPayload),
            });

            toast({ title: "Thành công", description: "Đã tạo Rental và cập nhật Booking!", status: "success" });
            onSuccess();
            onClose();

        } catch (error: any) {
            console.error("Process Error:", error);
            toast({ title: "Lỗi", description: error.message, status: "error" });
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
                        <FormControl isRequired>
                            <FormLabel>Assign Dealer</FormLabel>
                            <Select
                                name="dealer_id"
                                placeholder="Select Dealer first"
                                value={formData.dealer_id}
                                onChange={handleInputChange}
                                bg={formData.dealer_id ? "green.50" : "white"}
                            >
                                {dealers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} (ID: {d.id})</option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Bike Selection */}
                        <FormControl isRequired isDisabled={!formData.dealer_id}>
                            <FormLabel>Select Motorbike</FormLabel>
                            {formData.dealer_id && filteredBikes.length === 0 ? (
                                <Text color="red.500" fontSize="sm">This dealer doesn't have available motorbikes now!</Text>
                            ) : (
                                <Select
                                    name="bike_id"
                                    placeholder={formData.dealer_id ? "Select a bike" : "Please select dealer first"}
                                    value={formData.bike_id}
                                    onChange={handleInputChange}
                                >
                                    {filteredBikes.map((bike) => (
                                        <option key={bike.id} value={bike.id}>
                                            {bike.model} - {bike.license_plate} ({bike.price.toLocaleString('vi-VN')} VNĐ)
                                        </option>
                                    ))}
                                </Select>
                            )}
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
        </Modal >
    );
};

export default UpdateBookingModal;