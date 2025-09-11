import axios from 'axios';

export const fetchProblems = async () => {
    const authToken = localStorage.getItem('authtoken');
    
    let url;
    const headers = {};
    const VITE_GET_ALL_PROBLEMS_PATH = import.meta.env.VITE_GET_ALL_PROBLEMS_PATH;
    const VITE_GET_PROBLEMS_WITH_STATUS_PATH = import.meta.env.VITE_GET_PROBLEMS_WITH_STATUS_PATH;

    if (authToken) {
        url = VITE_GET_PROBLEMS_WITH_STATUS_PATH;
        headers['auth-token'] = authToken;
    } else {
        url = VITE_GET_ALL_PROBLEMS_PATH;
    }

    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error("Error in fetchProblems service:", error);
        throw new Error("Error fetching problems from the server.");
    }
};