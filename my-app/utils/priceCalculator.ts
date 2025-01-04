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

  // random factor that varies between 0.9 and 1.1 (±10%)
  const randomFactor = 1 + ((Math.random() - 0.5) * 0.2);
  const currentPrice = listedPrice - (priceRange * Math.pow(timeProgress * randomFactor, 2));
  
  return Math.max(Math.round(currentPrice * 100) / 100, minimumPrice);
}