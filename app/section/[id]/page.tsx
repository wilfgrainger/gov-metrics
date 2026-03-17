import { notFound } from "next/navigation";
import SectionNav from "../../components/SectionNav";
import { SECTIONS } from "../../lib/sections";
import { SECTION_CONTENT } from "../../lib/sectionContent";

const ISSUE_DATE = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function SectionHeader({
  tag,
  title,
  subtitle,
  num,
}: {
  tag: string;
  title: string;
  subtitle: string;
  num: string;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 border-b-4 border-black pb-4 sm:flex-row sm:items-start sm:gap-2">
      <div className="min-w-0">
        <div className="mb-1 font-mono text-xs uppercase tracking-widest text-gray-500">
          {tag}
        </div>
        <h1 className="font-display text-2xl leading-none tracking-wider md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 font-mono text-xs text-gray-600">{subtitle}</p>
      </div>
      <div className="font-display text-accent self-end text-4xl leading-none md:text-6xl sm:ml-2 sm:self-auto">
        {num}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(SECTION_CONTENT).map((id) => ({ id }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = SECTION_CONTENT[id as keyof typeof SECTION_CONTENT];

  if (!section) {
    notFound();
  }

  const SectionComponent = section.component;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-50 bg-white">
        <div className="flex items-center justify-between border-b-4 border-black bg-black px-4 py-2 text-white md:px-6">
          <span className="font-mono text-[10px] uppercase tracking-widest md:text-xs">
            UK Public Data
          </span>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full bg-red-500"
              style={{ animation: "pulse-live 1.5s ease-in-out infinite" }}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-red-400 md:text-xs">
              Live
            </span>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest opacity-60 sm:inline md:text-xs">
            {ISSUE_DATE}
          </span>
        </div>
        <SectionNav sections={SECTIONS} />
      </div>

      <main className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-8">
        <div className="mb-8 border-l-8 border-black pl-4 md:pl-6">
          <div className="mb-1 font-mono text-xs uppercase tracking-widest text-gray-500">
            {section.category} / Dedicated page
          </div>
          <p className="max-w-2xl font-display text-xl leading-tight tracking-wide md:text-3xl">
            Navigate between sections from the fixed top menu.
          </p>
        </div>

        <section className="dashboard-card relative mb-6 border-4 border-black bg-white p-4 md:p-6">
          <SectionHeader
            tag={section.tag}
            title={section.title}
            subtitle={section.subtitle}
            num={section.num}
          />
          <SectionComponent />
        </section>
      </main>
    </div>
  );
}
