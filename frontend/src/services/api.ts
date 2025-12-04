import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
    search: async (query: string) => {
        const response = await axios.get(`${API_BASE_URL}/search`, { params: { query } });
        return response.data;
    },
    suggest: async (prefix: string) => {
        const response = await axios.get(`${API_BASE_URL}/suggest`, { params: { prefix } });
        return response.data;
    },
    spellCheck: async (word: string) => {
        const response = await axios.get(`${API_BASE_URL}/spellcheck`, { params: { word } });
        return response.data;
    },
    crawl: async (url: string) => {
        const response = await axios.post(`${API_BASE_URL}/crawl`, null, { params: { url } });
        return response.data;
    },
    getFrequencyStats: async () => {
        const response = await axios.get(`${API_BASE_URL}/frequency`);
        return response.data;
    },
    getHistory: async () => {
        const response = await axios.get(`${API_BASE_URL}/history`);
        return response.data;
    },
    getPlans: async () => {
        const response = await axios.get(`${API_BASE_URL}/plans`);
        return response.data;
    }
};
