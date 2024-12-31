import Image from "next/image";
import ProductList from '../components/ProductList';
import Navbar from '../components/Navbar';
export default function Home() {
  return (
    <div className="max-w-[900px] m-auto max-h-screen">
              <Navbar />
      <main className="flex flex-col gap-8 row-start-2 items-center">

        <h1 className="text-4xl font-bold">PRODUCT LIST </h1>
        <p>nab the best deals from your block</p>
        <ProductList />
      </main>
    </div>
  );
}
