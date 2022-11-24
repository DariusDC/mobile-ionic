import axios from "axios";
import { config } from "../core";


const authURL = `http://localhost:3000/api/auth/login`;

export interface AuthProps {
    token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
    return axios.post(authURL, { username, password }, config).then(res => Promise.resolve(res.data)).catch(err => Promise.reject(err));
}