import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3300/api/v1/";

export interface Park {
  id: number;
  name: string;
  location: string;
  image?: string;
  created_at: Date;
  updated_at: Date;
}

// Lấy tất cả parks
export const getAllParks = async (): Promise<Park[]> => {
  try {
    const response = await axios.get(`${API_URL}parks/`);
    console.log("✅ Parks loaded from API:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching parks:", error);
    throw error;
  }
};

// Lấy park theo ID
export const getParkById = async (id: number): Promise<Park> => {
  try {
    const response = await axios.get(`${API_URL}parks/park/${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching park ${id}:`, error);
    throw error;
  }
};
