"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

const FALLBACK_URL = "https://wilfgrainger.github.io/gov-metrics";

interface SocialShareProps {
  title?: string;
  compact?: boolean;
}

type ShareNetwork = "X" | "Facebook" | "LinkedIn" | "WhatsApp";

function getCurrentUrl() {
  return typeof window === "undefined" ? FALLBACK_URL : window.location.href;
}

function buildShareHref(network: ShareNetwork, title: string, url: string) {
  const shareText = `${title} - Real-time UK public data metrics and analysis from public sources.`;
  switch (network) {
    case "X":
      return `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    case "Facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case "LinkedIn":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    case "WhatsApp":
      return `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;
    default:
      return url;
  }
}

export default function SocialShare({
  title = "PULSE - UK Public Data Intelligence",
  compact = false,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

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
    const pageUrl = getCurrentUrl();
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

  const handleShareClick =
    (network: ShareNetwork) => (event: MouseEvent<HTMLAnchorElement>) => {
      const liveHref = buildShareHref(network, title, getCurrentUrl());
      event.preventDefault();
      window.open(liveHref, "_blank", "noopener,noreferrer");
    };

  const shareLinks: Array<{ name: ShareNetwork; label: string; href: string }> = [
    {
      name: "X",
      label: "X",
      href: buildShareHref("X", title, FALLBACK_URL),
    },
    {
      name: "Facebook",
      label: "FB",
      href: buildShareHref("Facebook", title, FALLBACK_URL),
    },
    {
      name: "LinkedIn",
      label: "IN",
      href: buildShareHref("LinkedIn", title, FALLBACK_URL),
    },
    {
      name: "WhatsApp",
      label: "WA",
      href: buildShareHref("WhatsApp", title, FALLBACK_URL),
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
            onClick={handleShareClick(link.name)}
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
      <div className="mb-3 font-mono text-xs uppercase tracking-widest text-gray-500">
        SHARE THIS DASHBOARD
      </div>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShareClick(link.name)}
            className="border-2 border-black px-4 py-2 font-mono text-xs font-bold transition-colors hover:bg-black hover:text-white"
            style={{ boxShadow: "2px 2px 0px #000" }}
            title={`Share on ${link.name}`}
          >
            {link.label} | {link.name.toUpperCase()}
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
