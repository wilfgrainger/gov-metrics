"use client";

import { useState } from "react";

interface SocialShareProps {
  title?: string;
  compact?: boolean;
}

export default function SocialShare({ title = "PULSE — UK Public Data Intelligence", compact = false }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== "undefined") return window.location.href;
    return "https://wilfgrainger.github.io/gov-metrics";
  };

  const shareText = `${title} — Real-time UK public data metrics and analysis from public sources.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = getUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    {
      name: "X",
      label: "𝕏",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`,
    },
    {
      name: "Facebook",
      label: "FB",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`,
    },
    {
      name: "LinkedIn",
      label: "IN",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`,
    },
    {
      name: "WhatsApp",
      label: "WA",
      href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + getUrl())}`,
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black px-2 py-1 font-mono text-[10px] font-bold hover:bg-black hover:text-white transition-colors"
            title={`Share on ${link.name}`}
          >
            {link.label}
          </a>
        ))}
        <button
          onClick={handleCopyLink}
          className="border-2 border-black px-2 py-1 font-mono text-[10px] font-bold hover:bg-black hover:text-white transition-colors"
          title="Copy link"
        >
          {copied ? "✓" : "LINK"}
        </button>
      </div>
    );
  }

  return (
    <div className="border-2 border-black p-4">
      <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-3">
        SHARE THIS DASHBOARD
      </div>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black px-4 py-2 font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors"
            style={{ boxShadow: "2px 2px 0px #000" }}
            title={`Share on ${link.name}`}
          >
            {link.label} · {link.name.toUpperCase()}
          </a>
        ))}
        <button
          onClick={handleCopyLink}
          className="border-2 border-black px-4 py-2 font-mono text-xs font-bold transition-colors"
          style={{
            boxShadow: "2px 2px 0px #000",
            background: copied ? "#000" : "#fff",
            color: copied ? "#FF3B00" : "#000",
          }}
          title="Copy link to clipboard"
        >
          {copied ? "✓ COPIED" : "⎘ COPY LINK"}
        </button>
      </div>
    </div>
  );
}
