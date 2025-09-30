import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const trackClick = async (elementId, elementType, page) => {
    try {
        await axios.post(`${API_BASE_URL}/api/traffic/track`, {
            elementId,
            elementType,
            page
        });
        // console.log('Click tracked:', { elementId, elementType, page });
    } catch (error) {
        console.error('Failed to track click:', error);
    }
};