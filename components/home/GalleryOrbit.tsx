"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { FeaturedGalleryItem } from "@/sanity/lib/types";
import styles from "./GalleryOrbit.module.css";

type OrbitSlot = {
  ring: "inner" | "outer";
  /** Angle on the ring, in degrees (270 = straight up, 90 = straight down) */
  angle: number;
};

const ORBIT_SLOTS: OrbitSlot[] = [
  { ring: "inner", angle: 270 },
  { ring: "inner", angle: 30 },
  { ring: "inner", angle: 150 },
  { ring: "outer", angle: 90 },
  { ring: "outer", angle: 210 },
  { ring: "outer", angle: 330 },
];

/**
 * Which event card lifts off a star for each orbit spot.
 * Cards are in reading order (top-left, top-middle, top-right, bottom-left, ...), and each one
 * feeds the spot on the ring that is closest to where it sits.
 */
const CARD_FOR_SLOT = [1, 5, 3, 4, 0, 2];

/**
 * The order the stars leave in: the top of the ring first, then clockwise, the bottom last.
 * ORDER[slot] is that slot's place in the line (0 = first).
 */
const ORDER = [0, 3, 4, 5, 2, 1];

/** The same slots in order around the ring, used to draw the constellation outline. */
const OUTLINE_ORDER = [0, 5, 1, 3, 2, 4];

/* ── The timeline (0 → 1 over the scroll). The CSS uses the same numbers through --a. ── */
const DEPART_START = 0.08; // when the first star leaves
const DEPART_GAP = 0.04; // gap between stars leaving
const FLIGHT = 0.3; // how long one star's flight takes
const departAt = (slot: number) => DEPART_START + ORDER[slot] * DEPART_GAP;
const arriveAt = (slot: number) => departAt(slot) + FLIGHT;
const LAST_ARRIVAL = DEPART_START + (ORDER.length - 1) * DEPART_GAP + FLIGHT;

/** The orbit starts turning once everything has formed (and stops again below this). */
const SPIN_ON = 0.74;
const SPIN_OFF = 0.66;

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
    // The scroll position at which this slot's star lands and blooms into its photo
    "--a": arriveAt(index).toFixed(3),
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
  const bridgeOutlineRef = useRef<SVGPolygonElement>(null);
  const bridgeThreadRefs = useRef<Array<SVGLineElement | null>>([]);
  const bridgeParticleRefs = useRef<Array<HTMLDivElement | null>>([]);

  const galleryItems = useMemo(() => {
    const validItems = (items || []).filter((item) => item?.image);

    return ORBIT_SLOTS.map((_, index) => {
      if (validItems.length === 0) return null;
      return validItems[index % validItems.length];
    });
  }, [items]);

  /**
   * One scroll timeline runs the whole Events → Gallery moment. It is written straight to the page
   * (a few CSS variables and some element styles), so React never re-renders during it:
   *   --g           0 → 1   the overall progress (the CSS reads it for the rings, nucleus and photos)
   *   --spin-in/out         how far each ring has turned (so the photos can stay upright)
   *   --lift        per event card: a warm glow just before its star leaves
   */
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const bridge = bridgeRef.current;
    if (!section || !stage || !bridge) return;

    // With "reduce motion" the CSS shows the finished orbit (--g defaults to 1) and nothing flies
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let eventsEl: HTMLElement | null = null;
    let scrollRaf = 0;
    let spinRaf = 0;

    // What was last written, so we only touch the page when something changed
    let gWritten = "";
    let spinInWritten = "";
    let spinOutWritten = "";
    let liftWritten: string[] = [];
    const lastPoints: ({ x: number; y: number; tail: number } | null)[] = [];

    /* ── Orbit spin ── */
    let spinOn = false;
    let hovering = false;
    let spinIn = 0;
    let spinOut = 0;
    let spinSpeed = 1;
    let spinLast = 0;

    const writeSpin = () => {
      const a = spinIn.toFixed(2);
      const b = spinOut.toFixed(2);
      if (a !== spinInWritten) {
        section.style.setProperty("--spin-in", a);
        spinInWritten = a;
      }
      if (b !== spinOutWritten) {
        section.style.setProperty("--spin-out", b);
        spinOutWritten = b;
      }
    };

    const spinLoop = (now: number) => {
      spinRaf = 0;
      const dt = spinLast ? Math.min(now - spinLast, 64) : 16;
      spinLast = now;
      let settled = false;

      if (spinOn) {
        // Slows to a crawl while you hover, so you can look at the photos
        const wanted = hovering ? 0.12 : 1;
        spinSpeed += (wanted - spinSpeed) * (1 - Math.exp(-dt / 260));
        spinIn += (dt / 1000) * (360 / 34) * spinSpeed;
        spinOut += (dt / 1000) * (360 / 48) * spinSpeed;
      } else {
        // Ease to the nearest full turn (looks identical to "not turned"), then rest
        const targetIn = Math.round(spinIn / 360) * 360;
        const targetOut = Math.round(spinOut / 360) * 360;
        const ease = 1 - Math.exp(-dt / 200);
        spinIn += (targetIn - spinIn) * ease;
        spinOut += (targetOut - spinOut) * ease;
        if (Math.abs(targetIn - spinIn) < 0.05 && Math.abs(targetOut - spinOut) < 0.05) {
          spinIn = 0;
          spinOut = 0;
          settled = true;
        }
      }

      writeSpin();
      if (spinOn || !settled) {
        spinRaf = window.requestAnimationFrame(spinLoop);
      } else {
        spinLast = 0;
      }
    };

    const ensureSpinLoop = () => {
      if (spinRaf) return;
      spinLast = 0;
      spinRaf = window.requestAnimationFrame(spinLoop);
    };

    const onPointerEnter = () => {
      hovering = true;
    };
    const onPointerLeave = () => {
      hovering = false;
    };
    stage.addEventListener("pointerenter", onPointerEnter);
    stage.addEventListener("pointerleave", onPointerLeave);

    /* ── The scroll timeline ── */
    const updateBridge = () => {
      scrollRaf = 0;
      if (!eventsEl) eventsEl = document.getElementById("events");

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const stageRect = stage.getBoundingClientRect();
      const stageCenterX = stageRect.left + stageRect.width / 2;
      const stageCenterY = stageRect.top + stageRect.height / 2;

      // Progress is timed to the LOWEST photo spot: every landing happens while it is on screen.
      // 0.58 (the last landing) is reached when the lowest spot is 70px above the bottom edge.
      const lowestSpot = stageCenterY + getResponsiveRadius("outer", viewportWidth);
      const progress = clamp((1.452 * viewportHeight - 70 - lowestSpot) / (0.78 * viewportHeight));

      const gText = progress.toFixed(4);
      if (gText !== gWritten) {
        section.style.setProperty("--g", gText);
        gWritten = gText;
      }

      // The orbit turns once everything has formed (with a gap so it never flickers)
      if (progress >= SPIN_ON) spinOn = true;
      else if (progress < SPIN_OFF) spinOn = false;
      if (spinOn || spinIn !== 0 || spinOut !== 0) ensureSpinLoop();

      const flying = progress > 0.005 && progress < LAST_ARRIVAL + 0.14;
      bridge.classList.toggle(styles.scrollBridgeActive, flying);

      const cards = eventsEl ? eventsEl.querySelectorAll<HTMLElement>(".ec-card") : null;
      const lifts: number[] = [];

      if (!flying) {
        lastPoints.length = 0;
      } else {
        const eventsRect = eventsEl?.getBoundingClientRect() ?? null;
        const targets: { x: number; y: number }[] = [];

        ORBIT_SLOTS.forEach((slot, index) => {
          const depart = departAt(index);
          const local = clamp((progress - depart) / FLIGHT); // 0 = waiting on its card, 1 = landed
          const charge = clamp((progress - (depart - 0.05)) / 0.05); // the star appears just before leaving

          // Where this star lands: its spot on the ring
          const radius = getResponsiveRadius(slot.ring, viewportWidth);
          const radians = (slot.angle * Math.PI) / 180;
          const toX = stageCenterX + Math.cos(radians) * radius;
          const toY = stageCenterY + Math.sin(radians) * radius;
          targets[index] = { x: toX, y: toY };

          // Where it leaves from: the centre of its event card (kept on screen)
          let fromX: number;
          let fromY: number;
          const cardIndex =
            cards && cards.length > 0 ? CARD_FOR_SLOT[index] % cards.length : -1;
          if (cards && cardIndex >= 0) {
            const rect = cards[cardIndex].getBoundingClientRect();
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

          // The card glows warm while its star charges up and leaves
          if (cardIndex >= 0) {
            const liftT = clamp((progress - (depart - 0.05)) / 0.17);
            lifts[cardIndex] = Math.max(lifts[cardIndex] ?? 0, Math.sin(Math.PI * liftT));
          }

          const particle = bridgeParticleRefs.current[index];
          const thread = bridgeThreadRefs.current[index];
          if (!particle) return;

          if (charge <= 0 || local >= 1) {
            particle.style.opacity = "0";
            thread?.setAttribute("opacity", "0");
            lastPoints[index] = null;
            return;
          }

          // A curved path, bent sideways (alternating left and right)
          const eased = smoothstep(0, 1, local);
          const dx = toX - fromX;
          const dy = toY - fromY;
          const dist = Math.hypot(dx, dy) || 1;
          const side = index % 2 === 0 ? 1 : -1;
          const bulge = clamp(dist * 0.2, 30, 150) * side;
          const controlX = (fromX + toX) / 2 - (dy / dist) * bulge;
          const controlY = (fromY + toY) / 2 + (dx / dist) * bulge;
          const u = 1 - eased;
          const x = u * u * fromX + 2 * u * eased * controlX + eased * eased * toX;
          const y = u * u * fromY + 2 * u * eased * controlY + eased * eased * toY;

          const endSize = slot.ring === "inner" ? 20 : 24;
          const size = lerp(10, endSize, eased) * (0.6 + 0.4 * charge);
          const fadeOut = local > 0.86 ? clamp((1 - local) / 0.14) : 1;

          // A comet tail that follows how fast the star is really moving (none when you stop)
          const previous = lastPoints[index];
          let tail = 0;
          let angle = 0;
          if (previous) {
            const vx = x - previous.x;
            const vy = y - previous.y;
            angle = (Math.atan2(vy, vx) * 180) / Math.PI + 180;
            const wanted = Math.min(100, Math.hypot(vx, vy) * 7) * Math.sin(Math.PI * local);
            tail = lerp(previous.tail, wanted, 0.35);
          }
          lastPoints[index] = { x, y, tail };

          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.opacity = `${(charge * fadeOut * 0.95).toFixed(3)}`;
          particle.style.transform = `translate3d(${(x - size / 2).toFixed(2)}px, ${(y - size / 2).toFixed(2)}px, 0)`;
          particle.style.setProperty("--tail", `${tail.toFixed(1)}px`);
          particle.style.setProperty("--ang", `${angle.toFixed(1)}deg`);

          // A thin golden thread from the card to the star while it rises
          if (thread) {
            thread.setAttribute("x1", fromX.toFixed(1));
            thread.setAttribute("y1", fromY.toFixed(1));
            thread.setAttribute("x2", x.toFixed(1));
            thread.setAttribute("y2", y.toFixed(1));
            thread.setAttribute("opacity", (0.55 * Math.sin(Math.PI * local) * charge).toFixed(3));
          }
        });

        // When the last star lands, the six stars briefly connect into a constellation outline
        const outline = bridgeOutlineRef.current;
        if (outline) {
          outline.setAttribute(
            "points",
            OUTLINE_ORDER.map((i) => `${targets[i].x.toFixed(1)},${targets[i].y.toFixed(1)}`).join(" "),
          );
          const outlineOpacity =
            smoothstep(LAST_ARRIVAL - 0.06, LAST_ARRIVAL, progress) *
            (1 - smoothstep(LAST_ARRIVAL + 0.02, LAST_ARRIVAL + 0.14, progress));
          outline.style.opacity = outlineOpacity.toFixed(3);
        }
      }

      // Hand the card glow to the page (only for cards whose value changed)
      if (cards) {
        cards.forEach((card, i) => {
          const text = (lifts[i] ?? 0).toFixed(3);
          if (liftWritten[i] !== text) {
            card.style.setProperty("--lift", text);
            liftWritten[i] = text;
          }
        });
      }
    };

    const requestBridgeUpdate = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(updateBridge);
    };

    updateBridge();
    window.addEventListener("scroll", requestBridgeUpdate, { passive: true });
    window.addEventListener("resize", requestBridgeUpdate);

    return () => {
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      if (spinRaf) window.cancelAnimationFrame(spinRaf);
      window.removeEventListener("scroll", requestBridgeUpdate);
      window.removeEventListener("resize", requestBridgeUpdate);
      stage.removeEventListener("pointerenter", onPointerEnter);
      stage.removeEventListener("pointerleave", onPointerLeave);
      eventsEl?.querySelectorAll<HTMLElement>(".ec-card").forEach((card) => {
        card.style.removeProperty("--lift");
      });
      liftWritten = [];
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-orbit-title"
      className={classNames(styles.section, "snap-start", "scroll-mt-16")}
    >
      {/* The flying stars: drawn on a layer fixed to the screen, so they can cross from the event cards to the orbit */}
      <div ref={bridgeRef} className={styles.scrollBridge} aria-hidden="true">
        <svg className={styles.bridgeSvg}>
          <polygon ref={bridgeOutlineRef} className={styles.bridgeOutline} points="" />
          {ORBIT_SLOTS.map((slot, index) => (
            <line
              key={`thread-${slot.angle}`}
              ref={(element) => {
                bridgeThreadRefs.current[index] = element;
              }}
              className={styles.bridgeThread}
              x1="0"
              y1="0"
              x2="0"
              y2="0"
              opacity="0"
            />
          ))}
        </svg>
        {ORBIT_SLOTS.map((slot, index) => (
          <div
            key={`bridge-${slot.angle}`}
            ref={(element) => {
              bridgeParticleRefs.current[index] = element;
            }}
            className={classNames(
              styles.bridgeParticle,
              index % 2 === 1 && styles.bridgeParticleGold,
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
            Every event becomes a memory: each one lifts off as a star, settles into orbit around a
            quiet atom of shared experience, and blooms into the moments we kept.
          </p>
        </div>

        <div ref={stageRef} className={styles.orbitStage} aria-label="Featured gallery orbit">
          <div className={`${styles.ringGuide} ${styles.innerGuide}`} aria-hidden="true" />
          <div className={`${styles.ringGuide} ${styles.outerGuide}`} aria-hidden="true" />
          <div className={styles.nucleus} aria-hidden="true" />

          <div className={`${styles.orbitRing} ${styles.innerRing}`}>
            {ORBIT_SLOTS.slice(0, 3).map((slot, index) => {
              const item = galleryItems[index];

              return (
                <figure
                  key={`inner-${slot.angle}`}
                  className={styles.orbitSlot}
                  style={getSlotStyle(slot, index)}
                >
                  <span className={styles.landRing} aria-hidden="true" />
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

          <div className={`${styles.orbitRing} ${styles.outerRing}`}>
            {ORBIT_SLOTS.slice(3).map((slot, localIndex) => {
              const index = localIndex + 3;
              const item = galleryItems[index];

              return (
                <figure
                  key={`outer-${slot.angle}`}
                  className={styles.orbitSlot}
                  style={getSlotStyle(slot, index)}
                >
                  <span className={styles.landRing} aria-hidden="true" />
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
