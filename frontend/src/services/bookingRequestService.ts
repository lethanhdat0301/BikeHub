import axios from '../apis/axios';

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
  // Tạo booking request mới (public - không cần login)
  async createBookingRequest(data: {
    user_id?: number;
    name: string;
    email: string;
    contact_method: string;
    contact_details: string;
    pickup_location: string;
  }): Promise<BookingRequest> {
    try {
      const response = await axios.post('/booking-requests/', data);
      return response.data;
    } catch (error) {
      console.error("Error creating booking request:", error);
      throw error;
    }
  }

  // Admin - Lấy tất cả booking requests
  async getAllBookingRequests(status?: string): Promise<BookingRequest[]> {
    try {
      const url = status
        ? `/booking-requests/?status=${status}`
        : '/booking-requests/';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      throw error;
    }
  }

  // Admin - Lấy thống kê
  async getStatistics() {
    try {
      const response = await axios.get('/booking-requests/statistics');
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  }

  // Admin - Cập nhật booking request
  async updateBookingRequest(
    id: number,
    data: { status?: string; admin_notes?: string }
  ): Promise<BookingRequest> {
    try {
      const response = await axios.put(`/booking-requests/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating booking request:", error);
      throw error;
    }
  }

  // Admin - Xóa booking request
  async deleteBookingRequest(id: number): Promise<BookingRequest> {
    try {
      const response = await axios.delete(`/booking-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting booking request:", error);
      throw error;
    }
  }
}

export default new BookingRequestService();
