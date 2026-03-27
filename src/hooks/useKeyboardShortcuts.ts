"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onF1: () => void;
  onF2: () => void;
  onEscape: () => void;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    (el as HTMLElement).isContentEditable
  );
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handlers.onEscape();
        return;
      }
      // F1/F2 yalnızca input odaklanmamışken
      if (isInputFocused()) return;

      if (e.key === "F1") {
        e.preventDefault();
        handlers.onF1();
      } else if (e.key === "F2") {
        e.preventDefault();
        handlers.onF2();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
