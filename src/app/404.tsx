import { Suspense } from "react";
import dynamic from "next/dynamic";

const NavBar = dynamic(() => import("@/components/NavBar"), { ssr: false });

export default function NotFoundPage() {
  return (
    <>
      <Suspense fallback={null}>
        <NavBar />
      </Suspense>
      <div className="text-center mt-40 text-2xl text-[#e74c3c]">
        Page not found
      </div>
    </>
  );
}
