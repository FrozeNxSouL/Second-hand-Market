import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { REPORT, PRODUCT } from "@/utils/api";

export async function createReport(Des: string, reportSelection: (string | null)[], me: string | undefined, reportwho: string | undefined, reportpic: string[]) {
    if (!me) {
        throw Error("Not logged in");
    }
    const cleanedReportSelection = reportSelection.filter(value => value !== null) as string[];

    await apiPost(REPORT.CREATE, {
        reportDescription: Des,
        reportSelection: cleanedReportSelection,
        reportPicture: reportpic,
        userId: reportwho,
    });
}

export async function getproductanduser(searchid: string) {
    try {
        const res = await apiGet(PRODUCT.GET(searchid));
        return res;
    } catch (error) {
        console.error('Error fetching product with user:', error);
        throw error;
    }
}

export async function getproduct(searchid: string) {
    try {
        const res = await apiGet(PRODUCT.GET(searchid));
        return res;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}