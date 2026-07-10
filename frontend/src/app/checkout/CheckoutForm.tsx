"use client";
import Button from "@/component/Button";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
import {
  PaymentElement,
  useElements,
  useStripe,
  AddressElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { ADMIN } from "@/utils/api";

interface CheckoutFormProps {
  clientSecret: string;
  handleSetPaymentSuccess: (value: boolean) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  handleSetPaymentSuccess,
}) => {
  const { cartTotalAmount, handleClearCart, handleSetPaymentIntent, cartItems } =
    useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [tax, setTax] = useState<number | null>(null);
  const { user } = useAuth();
  const formattedPrice =
    tax != null ? formatPrice(cartTotalAmount * (tax/100) + cartTotalAmount) : null;

  useEffect(() => {
    const fetchTax = async () => {
      try {
        const res = await apiGet(ADMIN.TAX);
        if (res?.tax != null) {
          setTax(res.tax);
        }
      } catch (error) {
        console.error("Error fetching tax:", error);
      }
    };
    fetchTax();
  }, []);

  useEffect(() => {
    if (!stripe || !clientSecret) return;
    handleSetPaymentSuccess(false);
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    setIsLoading(true);

    stripe
      .confirmPayment({
        elements,
        redirect: "if_required",
      })
      .then(async (result) => {
        if (!result.error) {
          toast.success("Checkout Success");
          handleClearCart();
          handleSetPaymentSuccess(true);
          handleSetPaymentIntent(null);
          // Wallet deduction is handled by the backend webhook
        }
        setIsLoading(false);
      });
  };

  const userAddress = user?.address as string[] | undefined;

  return (
    <form onSubmit={handleSubmit} id="payment-form">
      <div className="mb-6">
        <h1 className="font-bold text-2xl">
          Enter your details to complete checkout
        </h1>
      </div>
      <h2 className="font-semibold mb-2">Address Information</h2>
      <AddressElement
        options={{
          mode: "shipping",
          defaultValues: {
            name: user?.name,
            address: userAddress ? {
              line1: userAddress[0] || "",
              line2: userAddress[1] || "",
              city: userAddress[2] || "",
              state: userAddress[3] || "",
              postal_code: userAddress[4] || "",
              country: 'TH',
            } : undefined,
          },
        }}
      />
      <h2 className="font-semibold mt-4 mb-2">Payment Information</h2>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <div className="py-4 text-center text-slate-700 text-xl font-bold">
        Total: {formattedPrice}
      </div>
      <Button
        label={isLoading ? "Processing" : "Pay now"}
        disabled={isLoading || !stripe || !elements}
        onClick={() => { }}
      />
    </form>
  );
};
export default CheckoutForm;