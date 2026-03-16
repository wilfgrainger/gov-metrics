"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

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
  const [expandedCategory, setExpandedCategory] = useState<string>(sections[0]?.category ?? "");

  const allSections = useMemo(() => sections.flatMap((g) => g.sections), [sections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const nextId = entry.target.id;
            setActiveSection(nextId);
            const containingGroup = sections.find((group) => group.sections.some((section) => section.id === nextId));
            if (containingGroup) {
              setExpandedCategory(containingGroup.category);
            }
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
  }, [allSections, sections]);


  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            aria-expanded={menuOpen}
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
            <button
              onClick={scrollToTop}
              className="w-full text-left px-4 py-3 border-b border-gray-200 font-mono text-xs tracking-widest uppercase bg-gray-50 hover:bg-black hover:text-white transition-colors"
            >
              ↑ Back to top
            </button>
            {sections.map((group) => {
              const isExpanded = expandedCategory === group.category;

              return (
                <div key={group.category} className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? "" : group.category)}
                    className="w-full px-4 py-3 bg-black text-white font-mono text-[10px] tracking-widest uppercase flex items-center justify-between"
                    aria-expanded={isExpanded}
                  >
                    {group.category}
                    <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>⌄</span>
                  </button>
                  {isExpanded && (
                    <div>
                      {group.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          aria-current={activeSection === section.id ? "location" : undefined}
                          className="block w-full text-left px-6 py-3 font-mono text-xs tracking-wider border-t border-gray-100 transition-colors"
                          style={{
                            color: activeSection === section.id ? "#FF3B00" : "#000",
                            backgroundColor: activeSection === section.id ? "#f5f5f5" : "transparent",
                          }}
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Desktop: horizontal grouped nav */}
        <div className="hidden md:block px-6 py-3 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex gap-4 font-mono text-xs tracking-widest whitespace-nowrap">
            <button
              onClick={scrollToTop}
              className="px-2 py-1 border border-black hover:bg-black hover:text-white transition-colors"
            >
              TOP
            </button>
            {sections.map((group) => (
              <div key={group.category} className="flex items-center gap-2 border-l border-gray-300 pl-4 first:border-l-0 first:pl-0">
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em]">{group.category}</span>
                <div className="flex items-center">
                  {group.sections.map((section, si) => (
                    <div key={section.id} className="flex items-center">
                      <button
                        onClick={() => scrollToSection(section.id)}
                        aria-current={activeSection === section.id ? "location" : undefined}
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
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Overlay to close menu when clicking outside */}
      {menuOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
