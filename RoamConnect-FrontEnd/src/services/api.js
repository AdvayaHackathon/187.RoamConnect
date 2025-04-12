import axios from 'axios';

const API_BASE_URL = 'https://roamconnect.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTourists = async () => {
  try {
    const response = await api.get('/tourists');
    return response.data;
  } catch (error) {
    console.error('Error fetching tourists:', error);
    throw error;
  }
};

export const updateTourist = async (formData) => {
  try {
    const response = await api.put('/tourists', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.status === 201) {
      return { status: 'success', data: response.data };
    }
    return response.data;
  } catch (error) {
    console.error('Error updating tourist:', error);
    throw error;
  }
};

export default api; 