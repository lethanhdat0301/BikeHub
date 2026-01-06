import axios from 'axios';

// 1. Cấu hình đường dẫn API
const API_URL = "http://localhost:3300/api/v1/";

// 2. Tạo một instance axios riêng cho Admin
const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // Quan trọng: Gửi kèm cookie nếu backend dùng cookie-based auth
    withCredentials: true,
});

// 3. (Tùy chọn) Tự động gắn Token nếu Admin dùng LocalStorage
// Nếu hệ thống Admin của bạn lưu token trong localStorage, đoạn này sẽ tự gắn vào Header
axiosClient.interceptors.request.use((config) => {
    // Kiểm tra các key thường dùng để lưu token
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("user_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export interface BookingRequest {
    id?: number;
    user_id?: number;
    name: string;
    email?: string;
    contact_method: string;
    contact_details: string;
    pickup_location: string;
    status?: string;
    admin_notes?: string;
    created_at?: string;
    updated_at?: string;
}

class BookingRequestService {

    async getAllBookingRequests(status?: string): Promise<BookingRequest[]> {
        try {
            const url = status
                ? `/booking-requests/?status=${status}`
                : '/booking-requests/';
            const response = await axiosClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching booking requests:", error);
            throw error;
        }
    }

    async getStatistics() {
        try {
            const response = await axiosClient.get('/booking-requests/statistics');
            return response.data;
        } catch (error) {
            console.error("Error fetching statistics:", error);
            throw error;
        }
    }

    async updateBookingRequest(
        id: number,
        data: { status?: string; admin_notes?: string }
    ): Promise<BookingRequest> {
        try {
            const response = await axiosClient.put(`/booking-requests/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating booking request:", error);
            throw error;
        }
    }

    async deleteBookingRequest(id: number): Promise<BookingRequest> {
        try {
            const response = await axiosClient.delete(`/booking-requests/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting booking request:", error);
            throw error;
        }
    }

    async createBookingRequest(data: {
        name: string;
        email?: string;
        contact_method: string;
        contact_details: string;
        pickup_location: string;
        user_id?: number;
        admin_notes?: string;
        status?: string;
    }): Promise<BookingRequest> {
        try {
            const response = await axiosClient.post('/booking-requests/', data);
            return response.data;
        } catch (error) {
            console.error("Error creating booking request:", error);
            throw error;
        }
    }
}

export default new BookingRequestService();
