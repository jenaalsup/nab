export interface Product {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  minimumPrice: number;
  endDate: number; 
  imageUrl: string;
  sellerId: string;
  sellerEmail: string;
  createdAt: number;
}