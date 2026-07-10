import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { PROFILE } from '@/utils/api';

export default async function updatePassword(current: string | null, new1: string | null, new2: string | null) {
    if (!current) throw new Error("Please, Enter current password");
    if (!new1) throw new Error("Please, Enter new password");
    if (!new2) throw new Error("Please, Enter repeat password");
    if (current === new1 || current === new2) throw new Error("Current and new password are the same");
    if (new1 !== new2) throw new Error("Password do not match");

    try {
        await apiPut(PROFILE.CHANGE_PASSWORD, {
            currentPassword: current,
            newPassword: new1,
            repeatPassword: new2,
        });
        return "Password updated successfully";
    } catch (e: any) {
        throw new Error(e.message || "Failed to update password");
    }
}