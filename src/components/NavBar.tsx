'use client'

import { useState } from "react";
import { CiGrid41 } from "react-icons/ci";
import { useRouter } from "next/navigation";

export default function NavBar() {
    const [search, setSearch] = useState("");
    const router = useRouter();

    return (
        <header className="backdrop-blur bg-gray-900/95 shadow-xl grid grid-cols-3 items-center fixed top-0 left-0 w-full z-50 h-20">
            <div className="col-start-1 flex items-center gap-3 justify-self-start ml-10">
                <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow">MAbmlai</span>
            </div>
            <div className="col-start-2 flex justify-center w-full">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-12 pr-4 py-2 rounded-full border-none bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e74c3c] shadow-lg transition-all duration-200"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e74c3c]">
                        <svg width="20" height="20" fill="none" stroke="#e74c3c" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                </div>
            </div>
            <div className="col-start-3 flex items-center gap-4 justify-self-end mr-10">
                <div className="flex gap-2">
                    <button
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] transition-all duration-150 shadow-md"
                        aria-label="Create new part"
                        onClick={() => router.push('/parts/new')}
                    >
                        <svg width="28" height="28" fill="none" stroke="#e74c3c" strokeWidth="3" viewBox="0 0 24 24" className="transition-colors duration-150 group-hover:stroke-white">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <button
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] transition-all duration-150 shadow-md"
                        aria-label="Go to parts"
                        onClick={() => router.push('/parts')}
                    >
                        <CiGrid41 size={28} color="#e74c3c" className="transition-colors duration-150 group-hover:stroke-white" />
                    </button>
                </div>
            </div>
        </header>
    );
}