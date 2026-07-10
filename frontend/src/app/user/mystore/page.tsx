import Link from "next/link";
import { EditButton } from "./mystoreFunction";
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { PRODUCT } from "@/utils/api";

export default async function MyStorePage() {
    let products: any[] = [];
    try {
        // Products are fetched on the backend with JWT auth
        // For server components, we pass auth via cookies or headers
        const res = await apiGet(PRODUCT.GETALL);
        products = res || [];
    } catch (error) {
        console.error('Error fetching products:', error);
    }

    return (
        <div className="flex flex-col items-center bg-base-200 w-full p-5 gap-2">
            <div className="divider text-2xl font-bold">My Store</div>
            <div className="flex justify-center w-full">
                <Link className="btn btn-primary w-1/5" href="/add-product">Create Product</Link>
            </div>
            <div className="w-full grid grid-cols-4 justify-items-center gap-y-5">
                {products.map((item, index) => (
                    <div key={index} className="bg-base-100 shadow-xl basis-60 transition cursor-pointer hover:ring-1 ring-primary w-56">
                        <EditButton data={item} />
                        <figure>
                            <img className="object-cover w-full h-40" src={item.imageUrl?.[0]} alt={item.name} />
                        </figure>
                    </div>
                ))}
            </div>
        </div>
    )
}