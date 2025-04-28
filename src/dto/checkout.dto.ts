export interface CheckoutItemDTO {
  productId: string;
  variantId: string; // Ensure variantId is included
  quantity: number;
  price: number;
}

export interface CheckoutDTO {
  items: CheckoutItemDTO[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'stripe' | 'paypal';
}
