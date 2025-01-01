export function calculateCurrentPrice(
  listedPrice: number,  // Changed from initialPrice
  minimumPrice: number,
  startDate: number,
  endDate: number,
  currentTime: number = Date.now() 
): number {
  if (currentTime >= endDate) return minimumPrice;
  if (currentTime <= startDate) return listedPrice;  // Changed from initialPrice

  const timeProgress = (currentTime - startDate) / (endDate - startDate);
  const priceRange = listedPrice - minimumPrice;  // Changed from initialPrice
  const currentPrice = listedPrice - (priceRange * Math.pow(timeProgress, 2));  // Changed from initialPrice
  
  return Math.max(Math.round(currentPrice * 100) / 100, minimumPrice);
}