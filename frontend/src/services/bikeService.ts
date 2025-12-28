import axios from '../apis/axios';

interface Bike {
  id: number;
  model: string;
  status: string;
  lock: boolean;
  location: string;
  price: number;
  park_id: number;
  image?: string;
}

class BikeService {
  async getAllBikes(): Promise<Bike[]> {
    try {
      const response = await axios.get('/api/v1/bikes/');
      return response.data;
    } catch (error) {
      console.error("Error fetching bikes:", error);
      throw error;
    }
  }

  async getBikeById(id: number): Promise<Bike> {
    try {
      const response = await axios.get(`/api/v1/bikes/bike/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bike with id ${id}:`, error);
      throw error;
    }
  }

  async getBikesByStatus(status: string, limit?: number): Promise<Bike[]> {
    try {
      const endpoint = limit 
        ? `/api/v1/bikes/status/${status}/${limit}`
        : `/api/v1/bikes/status/${status}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bikes with status ${status}:`, error);
      throw error;
    }
  }
}

export default new BikeService();
