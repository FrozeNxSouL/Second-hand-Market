
import { CATEGORY } from "@/utils/api";
import AddProductForm from "./addProductForm";
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

export default async function AddProductPage() {

    const res = await apiGet(CATEGORY.GETALL);
    const fetchedProduct = res;

  return (
    <>
      <AddProductForm data={fetchedProduct} />
    </>
  )
}

