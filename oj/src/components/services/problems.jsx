import axios from 'axios';

const GET_PROBLEM_PATH = import.meta.env.VITE_GET_PROBLEM_PATH;

export const fetchProblems = async ()=> {
    try {
        const response = await axios.get(GET_PROBLEM_PATH);
        return response.data;
    } catch (err){
        throw new Error(err);
    }
}