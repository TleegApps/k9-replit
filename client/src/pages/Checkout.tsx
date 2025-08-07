import { useState, useEffect } from "react";
import { useElements, useStripe, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft, CreditCard, ShoppingBag, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || 
  process.env.VITE_STRIPE_PUBLIC_KEY || 
  "pk_test_default"
);

interface CheckoutFormProps {
  totalAmount: number;
  onSuccess: () => void;
}

function CheckoutForm({ totalAmount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?success=true`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-montserrat font-semibold text-lg text-midnight">Payment Information</h3>
        <PaymentElement />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-mustard text-midnight py-4 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all disabled:opacity-50"
        data-testid="complete-payment-button"
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-midnight border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Complete Payment - ${totalAmount.toFixed(2)}</span>
          </div>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, removeFromCart, showToast } = useStore();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  // Check for success parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setPaymentSuccessful(true);
    }
  }, []);

  // Fetch cart products
  const { data: cartProducts, isLoading } = useQuery({
    queryKey: ["/api/products", { ids: cartItems }],
    queryFn: async () => {
      if (cartItems.length === 0) return [];
      
      const products = await Promise.all(
        cartItems.map(async (id) => {
          const response = await fetch(`/api/products/${id}`);
          if (!response.ok) throw new Error("Failed to fetch product");
          return response.json();
        })
      );
      return products;
    },
    enabled: cartItems.length > 0,
  });

  // Calculate totals
  const subtotal = cartProducts?.reduce((sum: number, product: Product) => 
    sum + parseFloat(product.price.toString()), 0) || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;

  // Create payment intent
  useEffect(() => {
    if (total > 0 && !paymentSuccessful) {
      apiRequest("POST", "/api/create-payment-intent", { amount: total })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
          showToast("Failed to initialize payment. Please try again.", "error");
        });
    }
  }, [total, paymentSuccessful]);

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccessful(true);
    // Clear cart items
    cartItems.forEach(id => removeFromCart(id));
  };

  if (paymentSuccessful) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="clay-morphic rounded-3xl p-12 shadow-clay text-center">
            <CardContent className="p-0">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-mint rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-montserrat font-bold text-3xl text-midnight">
                    Payment Successful!
                  </h1>
                  <p className="text-lg text-midnight/70">
                    Thank you for your purchase. Your order has been confirmed.
                  </p>
                </div>
                <div className="bg-softgray rounded-2xl p-6">
                  <h3 className="font-semibold text-midnight mb-2">What's Next?</h3>
                  <ul className="text-sm text-midnight/70 space-y-1">
                    <li>• You'll receive an order confirmation email shortly</li>
                    <li>• Your items will be shipped within 1-2 business days</li>
                    <li>• Track your order using the link in your confirmation email</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button className="bg-mustard text-midnight px-6 py-3 rounded-2xl">
                      Continue Shopping
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="border-lavender/30 hover:bg-lavender/10 px-6 py-3 rounded-2xl">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="clay-morphic rounded-3xl p-12 shadow-clay text-center">
            <CardContent className="p-0">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-lavender/30 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-lavender" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-montserrat font-bold text-2xl text-midnight">
                    Your Cart is Empty
                  </h1>
                  <p className="text-midnight/70">
                    Add some products to your cart before checking out.
                  </p>
                </div>
                <Link href="/products">
                  <Button className="bg-mustard text-midnight px-8 py-3 rounded-2xl">
                    Shop Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading || !clientSecret) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="clay-morphic rounded-3xl p-8 shadow-clay text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-mustard to-mint rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <h3 className="font-montserrat font-semibold text-xl text-midnight mb-2">
              Preparing Checkout...
            </h3>
            <p className="text-midnight/60">Please wait while we set up your payment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/products">
            <Button
              variant="outline"
              className="mb-4 border-lavender/30 hover:bg-lavender/10"
              data-testid="back-to-products"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          
          <h1 className="font-montserrat font-bold text-4xl text-midnight">
            Checkout
          </h1>
          <p className="text-lg text-midnight/70 mt-2">
            Complete your purchase securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
              <CardContent className="p-0">
                <h2 className="font-montserrat font-bold text-xl text-midnight mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  {cartProducts?.map((product: Product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 bg-softgray rounded-2xl">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-midnight line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-midnight/60">Qty: 1</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-midnight">${parseFloat(product.price.toString()).toFixed(2)}</p>
                        <Button
                          onClick={() => removeFromCart(product.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 p-0 h-auto"
                          data-testid={`remove-item-${product.id}`}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="mt-4 p-3 bg-mint/20 rounded-2xl">
                    <p className="text-sm text-mint font-medium">
                      🎉 You qualify for FREE shipping!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="order-1 lg:order-2 space-y-6">
            
            {/* Shipping Information */}
            <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
              <CardContent className="p-0">
                <h2 className="font-montserrat font-bold text-xl text-midnight mb-6">
                  Shipping Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleShippingChange('firstName', e.target.value)}
                      className="mt-1"
                      data-testid="shipping-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleShippingChange('lastName', e.target.value)}
                      className="mt-1"
                      data-testid="shipping-last-name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      className="mt-1"
                      data-testid="shipping-email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      className="mt-1"
                      data-testid="shipping-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      className="mt-1"
                      data-testid="shipping-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => handleShippingChange('state', e.target.value)}
                      className="mt-1"
                      data-testid="shipping-state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      className="mt-1"
                      data-testid="shipping-zip"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
              <CardContent className="p-0">
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm totalAmount={total} onSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-mustard mx-auto mb-4" />
                    <p className="text-midnight/70">Unable to initialize payment. Please refresh the page.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-mint/10 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-sm text-midnight/70">
                <CheckCircle className="w-4 h-4 text-mint" />
                <span>Secure SSL encrypted payment powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
