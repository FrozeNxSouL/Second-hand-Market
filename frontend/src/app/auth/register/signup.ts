import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { AUTH } from '@/utils/api';

export interface signUpForm {
    email: string,
    name: string,
    pass: string,
    rePass: string
}

export async function signup(signUpData: signUpForm) {
    const { email, name, pass, rePass } = signUpData;

    if (!email || !name || !pass || !rePass) {
        throw new Error("Please, Fill all required fields")
    }

    if (!email.includes("@") || !email.includes(".")) {
        throw new Error("Invalid email");
    }
    
    if (pass !== rePass) {
        throw new Error("Password do not match");
    }

    const filters = [" "]
    filters.forEach(word => {
        if (name.includes(word)) {
            throw new Error("Can't use this name")
        }
    });

    const res = await apiPost(AUTH.REGISTER, {
        email,
        password: pass,
        name,
    });

    return res;
}