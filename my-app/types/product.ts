export interface Product {
  id: string;
  title: string;
  description: string;
  listedPrice: number;    // Original listing price (never changes)
  currentPrice: number;   // Current price (updates periodically)
  minimumPrice: number;   // Minimum price (never changes)
  endDate: number;
  imageUrl: string;
  sellerId: string;
  sellerEmail: string;
  createdAt: number;
}