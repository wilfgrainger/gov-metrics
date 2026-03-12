"use client";

import { useState, useEffect, useCallback } from "react";

interface SectionItem {
  id: string;
  label: string;
}

interface CategoryGroup {
  category: string;
  sections: SectionItem[];
}

export default function SectionNav({ sections }: { sections: CategoryGroup[] }) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  const allSections = sections.flatMap((g) => g.sections);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    for (const section of allSections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [allSections]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const activeLabel = allSections.find((s) => s.id === activeSection)?.label || "SECTIONS";

  return (
    <>
      <nav className="border-b-2 border-black bg-gray-50 sticky top-0 z-50">
        {/* Mobile: hamburger + current section */}
        <div className="md:hidden flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 font-mono text-xs tracking-widest"
            aria-label="Toggle navigation menu"
          >
            <div className="flex flex-col gap-1">
              <span className={`block w-5 h-0.5 bg-black transition-transform ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
              <span className={`block w-5 h-0.5 bg-black transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-black transition-transform ${menuOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
            </div>
            <span className="uppercase font-bold">MENU</span>
          </button>
          <span className="font-mono text-[10px] tracking-widest text-[#FF3B00] uppercase truncate max-w-[200px]">
            {activeLabel}
          </span>
        </div>

        {/* Mobile: dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t-2 border-black bg-white max-h-[70vh] overflow-y-auto">
            {sections.map((group) => (
              <div key={group.category}>
                <div className="px-4 py-2 bg-black text-white font-mono text-[10px] tracking-widest uppercase">
                  {group.category}
                </div>
                {group.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="block w-full text-left px-6 py-3 font-mono text-xs tracking-wider border-b border-gray-100 transition-colors"
                    style={{
                      color: activeSection === section.id ? "#FF3B00" : "#000",
                      backgroundColor: activeSection === section.id ? "#f5f5f5" : "transparent",
                    }}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Desktop: horizontal scrolling nav */}
        <div className="hidden md:block px-6 py-3 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex gap-0 font-mono text-xs tracking-widest whitespace-nowrap">
            {sections.map((group, gi) => (
              <div key={group.category} className="flex items-center">
                {gi > 0 && <span className="text-gray-300 mx-1">|</span>}
                {group.sections.map((section, si) => (
                  <div key={section.id} className="flex items-center">
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className="px-2 py-1 hover:bg-black hover:text-white cursor-pointer transition-colors"
                      style={{
                        color: activeSection === section.id ? "#FF3B00" : "#000",
                        backgroundColor: activeSection === section.id ? "#000" : "transparent",
                      }}
                    >
                      {section.label}
                    </button>
                    {si < group.sections.length - 1 && <span className="text-gray-300">·</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Overlay to close menu when clicking outside */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
