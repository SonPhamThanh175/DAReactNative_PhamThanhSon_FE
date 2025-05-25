export interface Property {
  _id: string;
  name: string;
  description: string;
  price: number;
  address: string;
  imageUrl?: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}