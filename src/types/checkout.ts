export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CartItem {
  id: string;
  price: number;
  quantity: number;
  [key: string]: any;
}