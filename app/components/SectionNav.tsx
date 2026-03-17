"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { CategoryGroup } from "../lib/sections";

export default function SectionNav({ sections }: { sections: CategoryGroup[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (id: string) => pathname === `/section/${id}`;

  return (
    <>
      <nav className="border-b-2 border-black bg-gray-50">
        <div className="md:hidden flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 font-mono text-xs tracking-widest"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <div className="flex flex-col gap-1">
              <span className={`block w-5 h-0.5 bg-black transition-transform ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
              <span className={`block w-5 h-0.5 bg-black transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-black transition-transform ${menuOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
            </div>
            <span className="uppercase font-bold">MENU</span>
          </button>
          <Link href="/" className="font-mono text-[10px] tracking-widest text-[#FF3B00] uppercase">
            Home
          </Link>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t-2 border-black bg-white max-h-[70vh] overflow-y-auto">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 border-b border-gray-200 font-mono text-xs tracking-widest uppercase bg-gray-50 hover:bg-black hover:text-white transition-colors"
            >
              Dashboard Home
            </Link>
            {sections.map((group) => (
              <div key={group.category} className="border-b border-gray-200">
                <div className="px-4 py-3 bg-black text-white font-mono text-[10px] tracking-widest uppercase">{group.category}</div>
                {group.sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`/section/${section.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-3 font-mono text-xs tracking-wider border-t border-gray-100 hover:bg-black hover:text-white transition-colors"
                    style={{ color: isActive(section.id) ? "#FF3B00" : "#000" }}
                  >
                    {section.shortLabel ?? section.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="hidden md:block px-6 py-3 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex gap-4 font-mono text-xs tracking-widest whitespace-nowrap">
            <Link href="/" className="px-2 py-1 border border-black hover:bg-black hover:text-white transition-colors">
              HOME
            </Link>
            {sections.map((group) => (
              <div key={group.category} className="flex items-center gap-2 border-l border-gray-300 pl-4 first:border-l-0 first:pl-0">
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em]">{group.category}</span>
                <div className="flex items-center">
                  {group.sections.map((section, si) => (
                    <div key={section.id} className="flex items-center">
                      <Link
                        href={`/section/${section.id}`}
                        className="px-2 py-1 hover:bg-black hover:text-white transition-colors"
                        style={{
                          color: isActive(section.id) ? "#FF3B00" : "#000",
                          backgroundColor: isActive(section.id) ? "#000" : "transparent",
                        }}
                      >
                        {section.label}
                      </Link>
                      {si < group.sections.length - 1 && <span className="text-gray-300">·</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {menuOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
