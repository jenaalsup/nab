import Image from "next/image";
import ProductList from '../components/ProductList';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-4xl font-bold">PRODUCT LIST </h1>
        <p>nab the best deals from your block</p>
        <ProductList />
      </main>
    </div>
  );
}
