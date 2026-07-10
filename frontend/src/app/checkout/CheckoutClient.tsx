"use client";
import { useCart } from "@/hooks/useCart";
import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions, loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CheckoutForm from "./CheckoutForm";
import Button from "@/component/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { CHECKOUT } from "@/utils/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_TEST_STRIPE_PUBLISHABLE_KEY as string
);

const CheckoutClient = () => {
  const { cartProducts, paymentIntent, handleSetPaymentIntent } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cartProducts) {
      setLoading(true);
      setError(false);

      apiPost(CHECKOUT.PAYMENT_INTENT, {
        items: cartProducts,
        paymentIntentId: paymentIntent,
      })
        .then((res) => {
          setLoading(false);
          setClientSecret(res.clientSecret);
          handleSetPaymentIntent(res.paymentIntentId);
        })
        .catch((error) => {
          setError(true);
          if (error.response?.status === 401) {
            return router.push("/auth/login");
          }
          toast.error("Something went wrong");
        });
    }
  }, [cartProducts, paymentIntent])

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      labels: "floating",
    },
  };

  const paymentHandler = (value: boolean) => {
    setPaymentSuccess(value);
  };

  return (
    <div className="w-full">
      {clientSecret && cartProducts && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm clientSecret={clientSecret} handleSetPaymentSuccess={paymentHandler} />
        </Elements>
      )}
      {loading && <div className="text-center">Loading Checkout</div>}
      {error && <div className="text-center text-rose-500">Something went wrong...</div>}
      {paymentSuccess && (
        <div className="flex items-center flex-col gap-4">
          <div className="text-teal-500 text-center">Payment Success</div>
          <div className="max-w-[220px] w-full">
            <Button label="View Your Orders" onClick={() => router.push('/orders')} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutClient;