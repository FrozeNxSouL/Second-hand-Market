import CartCount from "./CartCount";
import SearchBox from "./searchBox";
import UserProfile from "./userProfile";
import Link from "next/link";
import { webName } from "../variables";
import { CATEGORY } from "@/utils/api";
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

export default async function NavBar() {
    let category: any[] = [];
    try {
        const res = await apiGet(CATEGORY.GETALL);
        category = res;
    } catch (err) {
        console.error("Failed to fetch categories:", err);
    }
    return (
        <div className="drop-shadow-md">
            <div className="navbar bg-accent">
                <div className="navbar-start">
                    <a href="/" className="btn btn-ghost text-xl text-base-100">{webName}</a>
                </div>
                <div className="navbar-center hidden lg:flex w-1/3">
                    <SearchBox></SearchBox>
                </div>
                <div className="navbar-end">
                    <button className="btn">
                        <CartCount />
                    </button>
                    <UserProfile />
                </div>
            </div>
            <div className="navbar flex justify-center gap-3 bg-accent">
                <div className="dropdown dropdown-hover">
                    <div tabIndex={0} className="btn m-1 btn-ghost text-base">
                        <span className="material-icons text-base-100">sell</span>
                        <span className="text-base-100">Category</span>
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        {category.map((value: any, idx: number) => (
                            <li key={idx}><Link href={`/tag/${value.name}`}>{value.name}</Link></li>
                        ))}
                    </ul>
                </div>
                <Link href="/search" className=" btn btn-ghost text-base">
                    <span className="material-icons text-base-100">shopping_bag</span>
                    <span className="text-base-100">Buy/Auction</span>
                </Link>
                <Link href="/add-product" className=" btn btn-ghost text-base">
                    <span className="material-icons text-base-100">storefront</span>
                    <span className="text-base-100">Sell</span>
                </Link>
                {/* <Link href="/search" className=" btn btn-ghost text-base">
                    <span className="material-icons">gavel</span>
                    <span>Auction</span>
                </Link> */}
            </div>
        </div>

    )
}