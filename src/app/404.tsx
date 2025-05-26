import { Suspense } from "react";
import NavBar from "@/components/NavBar";

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
