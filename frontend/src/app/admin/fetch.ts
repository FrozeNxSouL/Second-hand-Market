import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { ADMIN, PRODUCT, ORDERS, WALLET } from '@/utils/api';

// Get management (tax + categories) — used by cart/checkout
export async function getManage() {
    try {
        const res = await apiGet(ADMIN.CATEGORIES);
        const taxRes = await apiGet(ADMIN.TAX);
        return { categorys: res, tax: taxRes?.tax || 0 };
    } catch (error) {
        console.log(error)
    }
}

// Find transaction by product ID
export async function scanForTrans(itemId: string) {
    try {
        const res = await apiGet(ORDERS.GETALL);
        // Orders endpoint returns transactions; frontend should filter
        return null; // Backend handles this now
    } catch (error) {
        console.error('Error scanning for transaction:', error);
        throw error;
    }
}

// Wallet update for cart items — handled by backend webhook
export async function updateWalletForCartItems(cartItems: any[]) {
    // Backend handles wallet updates via stripe webhook
    console.log('Wallet update handled by backend');
}

// Find user by product ID
export async function findUserByProductId(productId: string) {
    try {
        const res = await apiGet(PRODUCT.GET(productId));
        return res?.User || null;
    } catch (error) {
        console.error('Error finding user by product id:', error);
        return null;
    }
}

// Get product owner userId
export async function getProductById(productId: string | undefined) {
    try {
        const res = await apiGet(PRODUCT.GET(productId!));
        return res?.userId;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

// Get address by userId — returns first transaction address
export const getAddressByUserId = async (userId: string) => {
    try {
        const res = await apiGet(ORDERS.GETALL);
        const orders = res;
        return orders?.[0] || null;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

// Change tax
export async function changeTax(newtax: number) {
    try {
        await apiPut(ADMIN.TAX, { tax: newtax });
    } catch (error) {
        console.log(error)
    }
}

// Update cash in wallet
export async function updateCashInWallet(userId: string, cash: number): Promise<void> {
    try {
        await apiPut(WALLET.ADD, { cash });
    } catch (error) {
        console.error('Error updating cash in wallet:', error);
        throw new Error('Failed to update cash in wallet');
    }
}

// Fetch cash in wallet
export async function fetchCashInWallet(userId: string): Promise<number | null> {
    try {
        const res = await apiGet(WALLET.GET);
        return res?.cash ?? null;
    } catch (error) {
        console.error('Error fetching cash in wallet:', error);
        throw new Error('Failed to fetch cash in wallet');
    }
}

// Check if product is scored
export async function isScored(itemId: string): Promise<boolean> {
    try {
        const res = await apiGet(PRODUCT.GET(itemId));
        return res?.score !== 0;
    } catch (error) {
        console.error('Error checking if product is scored:', error);
        throw error;
    }
}

// Update owner score
export async function updateOwnerScore(itemId: string, newRating: number) {
    try {
        await apiPut(PRODUCT.UPDATE(itemId), { score: newRating });
    } catch (error) {
        console.error('Error updating owner score:', error);
    }
}

// Update products in transaction — handled by webhook
export async function updateProductsInTransaction(transacId: string): Promise<void> {
    // Backend handles this via stripe webhook
}

// Update wallet by userId
export async function updateWallet(userId: string, formattedPrice: number | null): Promise<void> {
    try {
        if (formattedPrice === null) return;
        await apiPut(WALLET.ADD, { cash: formattedPrice });
    } catch (error) {
        console.error('Error updating wallet:', error);
        throw new Error('Failed to update wallet');
    }
}

// Add tag/category
export async function tagAdd(addname: string, addurl: string, adminid: string) {
    await apiPost(ADMIN.CATEGORIES, { name: addname, url: addurl });
}

// Edit tag/category
export async function editTag(catid: string, catname: string, caturl: string) {
    await apiPut(ADMIN.CATEGORY(catid), { name: catname, url: caturl });
}

// Delete tag/category
export async function deleteTag(catid: string) {
    await apiDelete(ADMIN.CATEGORY(catid));
}

// Get users with reports
export async function getUser(usersearch: string) {
    try {
        const res = await apiGet(ADMIN.USERS, { search: usersearch });
        return res;
    } catch (error) {
        return [];
    }
}

// Soft-delete user
export async function deleteUser(userid: string) {
    await apiPut(ADMIN.USER(userid), { role: 'deleted' });
}

// Soft-delete product
export async function deleteProduct(productid: string) {
    await apiPut(PRODUCT.UPDATE(productid), { status: 'expired' });
}

// Update report status
export async function statusReport(reportid: string) {
    await apiPut(ADMIN.REPORT(reportid), { reportStatus: '0' });
}