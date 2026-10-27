"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { FeaturedGalleryItem } from "@/sanity/lib/types";
import styles from "./GalleryOrbit.module.css";

type OrbitPhase = "idle" | "open" | "exiting";

type OrbitSlot = {
  ring: "inner" | "outer";
  angle: number;
  collapseX: string;
  collapseY: string;
  delay: number;
};

const ORBIT_SLOTS: OrbitSlot[] = [
  {
    ring: "inner",
    angle: 270,
    collapseX: "clamp(-42px, -7vw, -26px)",
    collapseY: "clamp(-222px, -30vw, -156px)",
    delay: 0.12,
  },
  {
    ring: "inner",
    angle: 30,
    collapseX: "clamp(160px, 28vw, 260px)",
    collapseY: "clamp(-112px, -18vw, -70px)",
    delay: 0.22,
  },
  {
    ring: "inner",
    angle: 150,
    collapseX: "clamp(-260px, -28vw, -160px)",
    collapseY: "clamp(-92px, -14vw, -56px)",
    delay: 0.32,
  },
  {
    ring: "outer",
    angle: 90,
    collapseX: "clamp(24px, 5vw, 52px)",
    collapseY: "clamp(164px, 27vw, 246px)",
    delay: 0.42,
  },
  {
    ring: "outer",
    angle: 210,
    collapseX: "clamp(-244px, -30vw, -166px)",
    collapseY: "clamp(78px, 15vw, 124px)",
    delay: 0.52,
  },
  {
    ring: "outer",
    angle: 330,
    collapseX: "clamp(166px, 30vw, 270px)",
    collapseY: "clamp(96px, 16vw, 148px)",
    delay: 0.62,
  },
];

/**
 * Which event card lifts off a star for each orbit spot.
 * Cards are in reading order (top-left, top-middle, top-right, bottom-left, ...), and each one
 * feeds the spot on the ring that is closest to where it sits.
 */
const CARD_FOR_SLOT = [1, 5, 3, 4, 0, 2];

function classNames(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function getResponsiveRadius(ring: OrbitSlot["ring"], viewportWidth: number) {
  if (viewportWidth <= 640) {
    return ring === "inner"
      ? clamp(viewportWidth * 0.26, 78, 104)
      : clamp(viewportWidth * 0.41, 126, 158);
  }

  return ring === "inner"
    ? clamp(viewportWidth * 0.17, 92, 168)
    : clamp(viewportWidth * 0.28, 154, 282);
}

function getSlotStyle(slot: OrbitSlot, index: number): CSSProperties {
  const angle = `${slot.angle}deg`;

  return {
    "--orbit-angle": angle,
    "--counter-angle": `-${angle}`,
    "--orbit-radius": slot.ring === "inner" ? "var(--inner-radius)" : "var(--outer-radius)",
    "--collapse-x": slot.collapseX,
    "--collapse-y": slot.collapseY,
    "--delay": `${slot.delay}s`,
    "--exit-delay": `${(ORBIT_SLOTS.length - index - 1) * 0.06}s`,
  } as CSSProperties;
}

export default function GalleryOrbit({
  items,
}: {
  items?: FeaturedGalleryItem[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const bridgeLineRef = useRef<SVGPolylineElement>(null);
  const bridgeParticleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollRafRef = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<OrbitPhase>("idle");
  const [phase, setPhase] = useState<OrbitPhase>("idle");

  const galleryItems = useMemo(() => {
    const validItems = (items || []).filter((item) => item?.image);

    return ORBIT_SLOTS.map((_, index) => {
      if (validItems.length === 0) return null;
      return validItems[index % validItems.length];
    });
  }, [items]);

  /**
   * One scroll-driven effect runs the whole Events → Gallery moment:
   *  - the six stars lift off the event cards and fly to the orbit ring
   *  - the orbit photos open exactly when the stars land (and fold away when you scroll back)
   *  - the event cards dip a little while their stars are away
   */
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const bridge = bridgeRef.current;
    if (!section || !stage || !bridge) return;

    // With "reduce motion" the CSS shows the finished orbit and there is no flight
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const lastPoints: ({ x: number; y: number; tail: number } | null)[] = [];
    let eventsEl: HTMLElement | null = null;
    let dimWritten = "";

    const clearExitTimer = () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };

    const goTo = (next: OrbitPhase) => {
      if (phaseRef.current === next) return;
      phaseRef.current = next;
      setPhase(next);
    };

    const setDim = (value: number) => {
      const text = value.toFixed(3);
      if (dimWritten === text) return;
      dimWritten = text;
      eventsEl?.style.setProperty("--g", text);
    };

    const updateBridge = () => {
      scrollRafRef.current = 0;
      if (!eventsEl) eventsEl = document.getElementById("events");

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const galleryRect = section.getBoundingClientRect();

      // 0 → 1 while the gallery rises into view
      const progress = clamp((viewportHeight * 1.08 - galleryRect.top) / (viewportHeight * 0.94));

      // ── The orbit opens and folds away with your scroll (with a gap so it never flickers) ──
      if (progress >= 0.5) {
        if (phaseRef.current !== "open") {
          clearExitTimer();
          goTo("open");
        }
      } else if (progress < 0.34 && phaseRef.current === "open") {
        goTo("exiting");
        clearExitTimer();
        exitTimerRef.current = setTimeout(() => {
          goTo("idle");
          exitTimerRef.current = null;
        }, 1200);
      }

      // The stars' flight takes the first half of the rise, so they land as the photos appear
      const flight = clamp(progress / 0.52);
      const bridgeOpacity = smoothstep(0, 0.08, progress) * (1 - smoothstep(0.5, 0.64, progress));
      const active =
        bridgeOpacity > 0.02 &&
        galleryRect.top < viewportHeight * 1.14 &&
        galleryRect.top > -viewportHeight * 0.36;

      bridge.classList.toggle(styles.scrollBridgeActive, active);
      bridge.style.opacity = active ? `${bridgeOpacity}` : "0";
      section.style.setProperty(
        "--parallax-shift",
        `${lerp(30, -14, progress).toFixed(2)}px`,
      );

      if (!active) {
        lastPoints.length = 0;
        setDim(0);
        return;
      }

      // The event cards dip a little while their stars are away, then come back
      setDim(Math.sin(flight * Math.PI));

      const stageRect = stage.getBoundingClientRect();
      const stageCenterX = stageRect.left + stageRect.width / 2;
      const stageCenterY = stageRect.top + stageRect.height / 2;
      const eventsRect = eventsEl?.getBoundingClientRect() ?? null;
      const cards = eventsEl ? eventsEl.querySelectorAll<HTMLElement>(".ec-card") : null;
      const eased = smoothstep(0, 1, flight);
      const linePoints: string[] = [];

      ORBIT_SLOTS.forEach((slot, index) => {
        const particle = bridgeParticleRefs.current[index];
        if (!particle) return;

        // Where this star lifts off: the centre of its event card (kept on screen)
        let fromX: number;
        let fromY: number;
        const card =
          cards && cards.length > 0 ? cards[CARD_FOR_SLOT[index] % cards.length] : null;
        if (card) {
          const rect = card.getBoundingClientRect();
          fromX = rect.left + rect.width / 2;
          fromY = rect.top + rect.height / 2;
        } else if (eventsRect) {
          fromX = eventsRect.left + eventsRect.width * (0.2 + 0.12 * index);
          fromY = eventsRect.bottom - 140;
        } else {
          fromX = viewportWidth * (0.2 + 0.12 * index);
          fromY = viewportHeight * 0.8;
        }
        fromX = clamp(fromX, 24, viewportWidth - 24);
        fromY = clamp(fromY, viewportHeight * 0.14, viewportHeight * 0.9);

        // Where it lands: its spot on the orbit ring
        const radius = getResponsiveRadius(slot.ring, viewportWidth);
        const radians = (slot.angle * Math.PI) / 180;
        const toX = stageCenterX + Math.cos(radians) * radius;
        const toY = stageCenterY + Math.sin(radians) * radius;

        // A curved path, bent sideways (alternating left and right)
        const dx = toX - fromX;
        const dy = toY - fromY;
        const dist = Math.hypot(dx, dy) || 1;
        const side = index % 2 === 0 ? 1 : -1;
        const bulge = clamp(dist * 0.2, 30, 140) * side;
        const controlX = (fromX + toX) / 2 - (dy / dist) * bulge;
        const controlY = (fromY + toY) / 2 + (dx / dist) * bulge;
        const u = 1 - eased;
        const x = u * u * fromX + 2 * u * eased * controlX + eased * eased * toX;
        const y = u * u * fromY + 2 * u * eased * controlY + eased * eased * toY;

        const startSize = slot.ring === "inner" ? 9 : 11;
        const endSize = slot.ring === "inner" ? 18 : 22;
        const size = lerp(startSize, endSize, eased);

        // A little pop as it lands
        const landing = clamp((flight - 0.8) / 0.2);
        const scale = 1 + Math.sin(landing * Math.PI) * 0.5;

        // A short comet tail that follows how fast the star is really moving
        const previous = lastPoints[index];
        let tail = 0;
        let angle = 0;
        if (previous) {
          const vx = x - previous.x;
          const vy = y - previous.y;
          angle = (Math.atan2(vy, vx) * 180) / Math.PI + 180;
          const wanted = Math.min(90, Math.hypot(vx, vy) * 7) * Math.sin(Math.PI * flight);
          tail = lerp(previous.tail, wanted, 0.35);
        }
        lastPoints[index] = { x, y, tail };

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = `${lerp(0.55, 0.95, bridgeOpacity)}`;
        particle.style.transform = `translate3d(${(x - size / 2).toFixed(2)}px, ${(y - size / 2).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        particle.style.setProperty("--tail", `${tail.toFixed(1)}px`);
        particle.style.setProperty("--ang", `${angle.toFixed(1)}deg`);
        linePoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      });

      if (bridgeLineRef.current) {
        bridgeLineRef.current.setAttribute("points", linePoints.join(" "));
      }
    };

    const requestBridgeUpdate = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = window.requestAnimationFrame(updateBridge);
    };

    updateBridge();
    window.addEventListener("scroll", requestBridgeUpdate, { passive: true });
    window.addEventListener("resize", requestBridgeUpdate);

    return () => {
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
      window.removeEventListener("scroll", requestBridgeUpdate);
      window.removeEventListener("resize", requestBridgeUpdate);
      clearExitTimer();
      eventsEl?.style.removeProperty("--g");
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-orbit-title"
      className={classNames(
        styles.section,
        "snap-start",
        "scroll-mt-16",
        phase === "open" && styles.isVisible,
        phase === "exiting" && styles.isExiting,
      )}
    >
      <div ref={bridgeRef} className={styles.scrollBridge} aria-hidden="true">
        <svg className={styles.bridgeSvg}>
          <polyline ref={bridgeLineRef} className={styles.bridgeLine} points="" />
        </svg>
        {ORBIT_SLOTS.map((slot, index) => (
          <div
            key={`bridge-${slot.angle}`}
            ref={(element) => {
              bridgeParticleRefs.current[index] = element;
            }}
            className={classNames(
              styles.bridgeParticle,
              index === 2 && styles.bridgeParticleGold,
            )}
          />
        ))}
      </div>

      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={`${styles.eyebrow} font-body`}>Featured Gallery</p>
          <h2 id="gallery-orbit-title" className={`${styles.title} font-display`}>
            Memories Return to <em>Orbit</em>
          </h2>
          <p className={`${styles.subtitle} font-body`}>
            Every event becomes a memory: each one lifts off as a star and settles into orbit around
            a quiet atom of shared experience.
          </p>
        </div>

        <div ref={stageRef} className={styles.orbitStage} aria-label="Featured gallery orbit">
          <svg
            className={styles.constellationLines}
            viewBox="0 0 1000 620"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              className={styles.line}
              points="120,78 804,116 314,214 862,390 498,536 164,420"
              fill="none"
            />
            <polyline
              className={styles.line}
              points="314,214 120,78 164,420 862,390"
              fill="none"
            />
          </svg>

          <div className={`${styles.ringGuide} ${styles.innerGuide}`} aria-hidden="true" />
          <div className={`${styles.ringGuide} ${styles.outerGuide}`} aria-hidden="true" />
          <div className={styles.nucleus} aria-hidden="true" />

          <div
            className={`${styles.orbitRing} ${styles.innerRing}`}
            style={{ "--orbit-duration": "34s" } as CSSProperties}
          >
            {ORBIT_SLOTS.slice(0, 3).map((slot, index) => {
              const item = galleryItems[index];

              return (
                <figure
                  key={`inner-${slot.angle}`}
                  className={styles.orbitSlot}
                  style={getSlotStyle(slot, index)}
                >
                  <div className={styles.photoFrame}>
                    {item?.image ? (
                      <Image
                        src={urlFor(item.image).width(320).height(320).fit("crop").auto("format").url()}
                        alt={item.title ? `${item.title} gallery moment` : "Featured gallery moment"}
                        fill
                        sizes="(max-width: 640px) 82px, (max-width: 1024px) 96px, 112px"
                      />
                    ) : (
                      <div className={styles.placeholder} aria-hidden="true" />
                    )}
                  </div>
                  {item?.title && <figcaption className={styles.caption}>{item.title}</figcaption>}
                </figure>
              );
            })}
          </div>

          <div
            className={`${styles.orbitRing} ${styles.outerRing}`}
            style={{ "--orbit-duration": "48s" } as CSSProperties}
          >
            {ORBIT_SLOTS.slice(3).map((slot, localIndex) => {
              const index = localIndex + 3;
              const item = galleryItems[index];

              return (
                <figure
                  key={`outer-${slot.angle}`}
                  className={styles.orbitSlot}
                  style={getSlotStyle(slot, index)}
                >
                  <div className={styles.photoFrame}>
                    {item?.image ? (
                      <Image
                        src={urlFor(item.image).width(360).height(360).fit("crop").auto("format").url()}
                        alt={item.title ? `${item.title} gallery moment` : "Featured gallery moment"}
                        fill
                        sizes="(max-width: 640px) 88px, (max-width: 1024px) 112px, 132px"
                      />
                    ) : (
                      <div className={styles.placeholder} aria-hidden="true" />
                    )}
                  </div>
                  {item?.title && <figcaption className={styles.caption}>{item.title}</figcaption>}
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}