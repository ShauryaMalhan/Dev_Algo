import axios from 'axios';

const VITE_GET_PROBLEMS_WITH_STATUS_PATH = import.meta.env.VITE_GET_PROBLEMS_WITH_STATUS_PATH;

export const fetchProblems = async ()=> {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error("User not authenticated");
        }

        const response = await axios.get(VITE_GET_PROBLEMS_WITH_STATUS_PATH, {
            headers: {
                'auth-token': token
            }
        });
        console.log("rere");
        return response.data;
    } catch (err){
        throw new Error(err);
    }
}