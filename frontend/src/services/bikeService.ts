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
      const response = await axios.get('/bikes/');
      return response.data;
    } catch (error) {
      console.error("Error fetching bikes:", error);
      throw error;
    }
  }

  async getBikeById(id: number): Promise<Bike> {
    try {
      const response = await axios.get(`/bikes/bike/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bike with id ${id}:`, error);
      throw error;
    }
  }

  async getBikesByStatus(status: string, limit?: number): Promise<Bike[]> {
    try {
      const endpoint = limit
        ? `/bikes/status/${status}/${limit}`
        : `/bikes/status/${status}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bikes with status ${status}:`, error);
      throw error;
    }
  }

  async getBikesByPark(parkId: number, status?: string, limit?: number): Promise<Bike[]> {
    try {
      const endpoint = `/bikes/park/${parkId}/${status || ''}/${limit || ''}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching motorbikes for park ${parkId}:`, error);
      throw error;
    }
  }
}

export default new BikeService();
