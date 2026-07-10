import React from 'react'
import LatestProducts from '@/component/panel/latestProduct';
import AuctionProducts from '@/component/panel/auction';
import CategoryList from '@/component/panel/category';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { AUCTION, ADMIN } from '@/utils/api';
export const dynamic = "force-dynamic";

interface CategoryItem {
  name: string;
  url: string;
}

export default async function HomePage() {
  let auctionProducts: any[] = [];
  let categories: CategoryItem[] = [];

  try {
    const [auctionRes, catRes] = await Promise.all([
      apiGet(AUCTION.GETALL, { limit: 3 }),
      apiGet(ADMIN.CATEGORIES)
    ]);
    auctionProducts = auctionRes;
    categories = catRes;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }

  return (
    <div className='mx-auto flex justify-center flex-col gap-5 bg-base-100 max-w-screen-xl px-32'>
      <CategoryList data={categories} />
      <AuctionProducts data={auctionProducts} />
      <div className="divider text-2xl font-bold">All Products</div>
      {categories.map((value: CategoryItem, index: number) => (
        <LatestProducts key={index} data={value.name} quantity={6} />
      ))}
    </div >
  )
}