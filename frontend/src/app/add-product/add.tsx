import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { PRODUCT } from '@/utils/api';

async function addProduct(formData: any, time: string | null) {
    if (!formData.name || !formData.description || formData.imageUrl.length === 0 || !formData.price || formData.price <= 0 || !formData.tag || !formData.status) {
        throw Error("Missing required fields or price <= 0, maybe forgot to upload");
    }

    if (formData.name.length > 100) {
        throw new Error("Product name cannot be longer than 100 characters");
    }
    if (formData.description.length > 600) {
        throw new Error("Product detail cannot be longer than 600 characters");
    }

    if (formData.imageUrl.length > 5) {
        throw new Error("Cannot upload more than 5 images");
    }

    const currentTime = new Date();
    const input = new Date(time || "").getTime()

    if ((formData.status == "auction" && !time) || (formData.status == "auction" && (input - currentTime.getTime() <= 0))) {
        throw Error("The auction product need time to expire");
    }

    try {
        await apiPost(PRODUCT.CREATE, {
            name: formData.name,
            description: formData.description,
            imageUrl: formData.imageUrl,
            price: formData.price,
            tag: formData.tag,
            status: formData.status,
            // Auction creation is handled by the backend when status === "auction"
        });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message || "Failed to create product");
    }
}
export default addProduct