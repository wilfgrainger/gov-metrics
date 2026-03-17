"use client";

import { useEffect, useRef, useState } from "react";

const FALLBACK_URL = "https://wilfgrainger.github.io/gov-metrics";

interface SocialShareProps {
  title?: string;
  compact?: boolean;
}

export default function SocialShare({
  title = "PULSE - UK Public Data Intelligence",
  compact = false,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);
  const [pageUrl] = useState(() =>
    typeof window === "undefined" ? FALLBACK_URL : window.location.href
  );

  const shareText = `${title} - Real-time UK public data metrics and analysis from public sources.`;

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const showCopiedState = () => {
    setCopied(true);
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      resetTimeoutRef.current = null;
    }, 2000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      showCopiedState();
    } catch {
      // Fallback for older browsers that do not expose async clipboard APIs.
      const textArea = document.createElement("textarea");
      textArea.value = pageUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showCopiedState();
    }
  };

  const shareLinks = [
    {
      name: "X",
      label: "X",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`,
    },
    {
      name: "Facebook",
      label: "FB",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    },
    {
      name: "LinkedIn",
      label: "IN",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    },
    {
      name: "WhatsApp",
      label: "WA",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`,
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
          {copied ? "OK" : "LINK"}
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
          {copied ? "OK COPIED" : "COPY LINK"}
        </button>
      </div>
    </div>
  );
}
