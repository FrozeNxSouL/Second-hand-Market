import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { PROFILE } from '@/utils/api';

export default async function updateAddr(addr: string[]) {
    try {
        await apiPut(PROFILE.UPDATE_ADDRESS, { address: addr });
        return "Address updated successfully";
    } catch (e: any) {
        throw new Error(e.message || "Failed to update address");
    }
}