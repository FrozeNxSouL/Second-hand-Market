"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { PRODUCT } from "@/utils/api";

interface ProductItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string[];
    price: number;
    tag: string[];
    status: string;
    score: number;
    userId: string;
}

export default function LatestProducts(props: { data: string; quantity: number }) {
    const router = useRouter();

    const [data, setData] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGet(PRODUCT.SEARCH, { tag: props.data, limit: props.quantity })
                setData(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [props.data, props.quantity]);

    return (
        <>
            {data.length > 0 && (
                <div className="w-full">
                    <div className="flex flex-col w-1/3 lg:flex-row m-12">
                        <div className="grid flex-grow h-14 card bg-primary rounded-box place-items-center text-xl font-bold text-base-100">Category</div>
                        <div className="divider lg:divider-horizontal"></div>
                        <div className="grid flex-grow h-14 card rounded-box place-items-center border-white border-2 text-xl font-semibold">{props.data}</div>
                    </div>
                    <div className="flex flex-col justify-center" >
                        <div className='flex flex-wrap justify-center'>
                            {data.map((item: ProductItem, idx: number) => (
                                <div onClick={() => router.push(`/product/${item.id}`)} className="bg-base-100 shadow-xl basis-72 m-2 transition cursor-pointer hover:ring-1 ring-primary" key={idx}>
                                    <figure>
                                        <img className="object-cover w-full h-40" src={item.imageUrl[0]} alt={item.name} />
                                    </figure>
                                    <div className="card-body p-5 bg-base-100">
                                        <div className="flex flex-wrap gap-2">
                                            {item.tag.slice().reverse().map((element: string, i: number) => (
                                                <div className="badge badge-outline" key={i}>{element}</div>
                                            ))}
                                        </div>
                                        <div className="card-title truncate overflow-hidden max-w-60 font-bold">{item.name}</div>
                                        <div className="card-actions justify-end">
                                            <div>
                                                <p className="font-semibold text-primary text-xl">฿ {item.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/search" className="btn btn-primary m-10">View more</Link>
                    </div>
                </div>
            )}
        </>
    )
}