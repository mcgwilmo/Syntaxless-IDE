"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR =
  ".page-enter, .page-enter-soft, .subscription-card-in, [data-scroll-reveal]";
const REVEAL_ROOT_MARGIN = "0px 0px -12% 0px";

function setRevealState(node: HTMLElement, state: "hidden" | "visible") {
  node.dataset.revealState = state;
}

function getRevealNodes(root: ParentNode) {
  return Array.from(root.querySelectorAll(REVEAL_SELECTOR)).filter(
    (node): node is HTMLElement => node instanceof HTMLElement
  );
}

export function ScrollRevealManager() {
  const pathname = usePathname();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nodes = new Set<HTMLElement>();
    let observer: IntersectionObserver | null = null;

    function ensureObserver() {
      if (observer || mediaQuery.matches) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setRevealState(
              entry.target as HTMLElement,
              entry.isIntersecting ? "visible" : "hidden"
            );
          });
        },
        {
          rootMargin: REVEAL_ROOT_MARGIN,
          threshold: 0,
        }
      );
    }

    function observeNode(node: HTMLElement) {
      if (nodes.has(node)) return;

      nodes.add(node);

      if (mediaQuery.matches) {
        setRevealState(node, "visible");
        return;
      }

      setRevealState(node, "hidden");
      ensureObserver();
      observer?.observe(node);
    }

    function scan(root: ParentNode = document) {
      getRevealNodes(root).forEach(observeNode);
    }

    function syncMotionPreference() {
      if (mediaQuery.matches) {
        observer?.disconnect();
        observer = null;
        nodes.forEach((node) => setRevealState(node, "visible"));
        return;
      }

      observer?.disconnect();
      observer = null;
      ensureObserver();
      nodes.forEach((node) => {
        setRevealState(node, "hidden");
        observer?.observe(node);
      });
    }

    scan();

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches(REVEAL_SELECTOR)) {
            observeNode(node);
          }

          scan(node);
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    mediaQuery.addEventListener("change", syncMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncMotionPreference);
      mutationObserver.disconnect();
      observer?.disconnect();
      nodes.clear();
    };
  }, [pathname]);

  return null;
}
