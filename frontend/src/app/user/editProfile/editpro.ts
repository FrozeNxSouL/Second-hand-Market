import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { PROFILE } from "@/utils/api";

export async function updateporfile(userid: string | undefined, username: string, useremail: string, userphone: string, userpic: string | undefined) {
    if (!userid) {
        throw new Error("Go login");
    }

    try {
        const data: any = {};
        if (useremail !== "") data.email = useremail;
        if (username !== "") data.name = username;
        if (userphone !== "") data.phone = userphone;
        if (userpic !== "") data.picture = userpic;

        await apiPut(PROFILE.UPDATE, data);
        return "Profile updated successfully";
    } catch (error: any) {
        throw new Error(error.message || error.message);
    }
}