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

const BRIDGE_SOURCE_POINTS = [
  { x: 60, y: 80 },
  { x: 200, y: 120 },
  { x: 840, y: 150 },
  { x: 760, y: 370 },
  { x: 70, y: 550 },
  { x: 910, y: 560 },
];

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
  const hasOpenedRef = useRef(false);
  const [phase, setPhase] = useState<OrbitPhase>("idle");

  const galleryItems = useMemo(() => {
    const validItems = (items || []).filter((item) => item?.image);

    return ORBIT_SLOTS.map((_, index) => {
      if (validItems.length === 0) return null;
      return validItems[index % validItems.length];
    });
  }, [items]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const bridge = bridgeRef.current;
    if (!section || !stage || !bridge) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const updateBridge = () => {
      scrollRafRef.current = 0;

      const eventsSection = document.getElementById("events");
      if (!eventsSection) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const eventsRect = eventsSection.getBoundingClientRect();
      const galleryRect = section.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const progress = clamp(
        (viewportHeight * 1.08 - galleryRect.top) /
          (viewportHeight * 0.94),
      );
      const bridgeFadeIn = smoothstep(0.01, 0.16, progress);
      const bridgeFadeOut = 1 - smoothstep(0.9, 1, progress);
      const bridgeOpacity = bridgeFadeIn * bridgeFadeOut;
      const active =
        bridgeOpacity > 0.02 &&
        galleryRect.top < viewportHeight * 1.14 &&
        galleryRect.top > -viewportHeight * 0.36 &&
        eventsRect.bottom > -viewportHeight * 0.82;

      bridge.classList.toggle(styles.scrollBridgeActive, active);
      bridge.style.opacity = active ? `${bridgeOpacity}` : "0";
      section.style.setProperty(
        "--parallax-shift",
        `${lerp(30, -14, progress).toFixed(2)}px`,
      );

      if (!active) return;

      const stageCenterX = stageRect.left + stageRect.width / 2;
      const stageCenterY = stageRect.top + stageRect.height / 2;
      const easedProgress = smoothstep(0, 1, progress);
      const linePoints: string[] = [];

      ORBIT_SLOTS.forEach((slot, index) => {
        const source = BRIDGE_SOURCE_POINTS[index];
        const particle = bridgeParticleRefs.current[index];
        if (!particle) return;

        const sourceX = eventsRect.left + eventsRect.width * (source.x / 1000);
        const sourceY = eventsRect.top + eventsRect.height * (source.y / 600);
        const radius = getResponsiveRadius(slot.ring, viewportWidth);
        const radians = (slot.angle * Math.PI) / 180;
        const targetX = stageCenterX + Math.cos(radians) * radius;
        const targetY = stageCenterY + Math.sin(radians) * radius;
        const parallaxOffset = lerp(-42, 24, progress) * (index % 2 === 0 ? 1 : -0.45);
        const x = lerp(sourceX, targetX, easedProgress);
        const y = lerp(sourceY, targetY, easedProgress) + parallaxOffset;
        const size = lerp(slot.ring === "inner" ? 8 : 10, slot.ring === "inner" ? 18 : 22, easedProgress);
        const scale = lerp(0.86, 1.08, Math.sin(progress * Math.PI));

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = `${lerp(0.5, 0.95, bridgeOpacity)}`;
        particle.style.transform = `translate3d(${(x - size / 2).toFixed(2)}px, ${(y - size / 2).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
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
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const clearExitTimer = () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearExitTimer();
          hasOpenedRef.current = true;
          setPhase("open");
          return;
        }

        if (!hasOpenedRef.current) return;

        setPhase("exiting");
        clearExitTimer();
        exitTimerRef.current = setTimeout(() => {
          setPhase("idle");
          exitTimerRef.current = null;
        }, 1200);
      },
      { threshold: 0.26, rootMargin: "-8% 0px -16% 0px" },
    );

    observer.observe(section);

    return () => {
      clearExitTimer();
      observer.disconnect();
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
            Six featured moments collapse from scattered stars into a quiet atom of shared experience.
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
