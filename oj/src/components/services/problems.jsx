import axios from 'axios';

const GET_PROBLEM_PATH = import.meta.env.VITE_GET_PROBLEM_PATH;

export const fetchProblems = async ()=> {
    try {
        const username = localStorage.getItem("username");
        if (!username) {
            throw new Error("User is not logged in.");
        }
        const response = await axios.get(GET_PROBLEM_PATH, {
            params: {
                username: username
            }
        });
        return response.data;
    } catch (err){
        throw new Error(err);
    }
}