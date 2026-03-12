"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  label: string;
}

export default function SectionNav({ sections }: { sections: Section[] }) {
  const [activeSection, setActiveSection] = useState<string>("");

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

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="border-b-2 border-black bg-gray-50 px-6 py-3 overflow-x-auto sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex gap-0 font-mono text-xs tracking-widest whitespace-nowrap">
        {sections.map((section, i) => (
          <div key={section.id} className="flex items-center">
            <button
              onClick={() => scrollToSection(section.id)}
              className="px-3 py-1 hover:bg-black hover:text-white cursor-pointer transition-colors"
              style={{
                color: activeSection === section.id ? "#FF3B00" : "#000",
                backgroundColor: activeSection === section.id ? "#000" : "transparent",
              }}
            >
              {section.label}
            </button>
            {i < sections.length - 1 && <span className="text-gray-300">·</span>}
          </div>
        ))}
      </div>
    </nav>
  );
}
