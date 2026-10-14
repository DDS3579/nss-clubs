import type { RefObject } from "react";
import Image from "next/image";
import { PLANET_DOT_MORPHS } from "@/hooks/useMorphCoordinates";
import { urlFor } from "@/sanity/lib/image";
import type { HomepageData } from "@/sanity/lib/types";
import ClubIcon from "./ClubIcon";

interface AboutSectionProps {
  data: HomepageData;
  /** Where the floating atom becomes the sun while you are in this section. */
  aboutAnchorRef: RefObject<HTMLDivElement | null>;
  planetMercuryRef: RefObject<HTMLDivElement | null>;
  planetVenusRef: RefObject<HTMLDivElement | null>;
  planetEarthRef: RefObject<HTMLDivElement | null>;
  planetSunRef: RefObject<HTMLDivElement | null>;
  planetMarsRef: RefObject<HTMLDivElement | null>;
  planetJupiterRef: RefObject<HTMLDivElement | null>;
  planetSaturnWrapRef: RefObject<HTMLDivElement | null>;
  /** The copies of the planets that fly into the events constellation. */
  morphGhostRefs: RefObject<(HTMLDivElement | null)[]>;
}

/** The "About" solar-system section plus the layer of planet copies that fly to Events. */
export default function AboutSection({
  data,
  aboutAnchorRef,
  planetMercuryRef,
  planetVenusRef,
  planetEarthRef,
  planetSunRef,
  planetMarsRef,
  planetJupiterRef,
  planetSaturnWrapRef,
  morphGhostRefs,
}: AboutSectionProps) {
  return (
    <>
      <section
        id="about"
        className="scroll-mt-16 about-solar-section"
      >
        {/* Anchor positioned over the sun in the solar system layout so the canvas atom
            morphs visually into the sun/planets before fading out */}
        <div
          ref={aboutAnchorRef}
          className="about-sun-anchor"
          style={{
            position: 'absolute' as const,
            pointerEvents: 'none' as const,
            opacity: 0,
            zIndex: 0,
          }}
        />
        {/* ── Title ── */}
        <div className="as-title">
          <h2 className="font-display">
            Our Journey &amp; <em>Impact</em>
          </h2>
          <p className="as-subtitle font-body">
            From a small spark to a blazing constellation of student leadership.
          </p>
        </div>

        {/* ═══ DESKTOP SOLAR SYSTEM LAYOUT ═══ */}
        <div className="solar-desktop">
          <div className="orbit-line-h" />

          {/* ═══════ LEFT COLUMN: 3 inner planets + Our Origin card ═══════ */}
          <div className="p-col" data-node="0">
            <div className="p-zone">
              <div ref={planetMercuryRef} className="p-sphere p-mercury" />
              <div ref={planetVenusRef} className="p-sphere p-venus" />
              <div ref={planetEarthRef} className="p-sphere p-earth" />
            </div>
            <div className="as-card as-card-dark about-panel">
              <div className="as-card-cat">
                <ClubIcon name="BookOpen" className="as-card-cat-icon" />
                <span className="as-card-cat-label font-body">History &amp; Heritage</span>
              </div>
              <h3 className="font-display">Our Origin</h3>
              <p className="as-card-body font-body">
                Founded in the heart of our institution, NSS Clubs began as a small
                group of passionate students with a shared dream — to create a vibrant
                community where every talent finds its stage.
              </p>
              <div className="as-card-stats">
                <div>
                  <div className="as-stat-label font-body">Founded</div>
                  <div className="as-stat-value font-display">2018</div>
                </div>
                <div>
                  <div className="as-stat-label font-body">Founders</div>
                  <div className="as-stat-value font-display">12</div>
                </div>
                <div>
                  <div className="as-stat-label font-body">First Event</div>
                  <div className="as-stat-value font-display">2019</div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ CENTER COLUMN: Sun + President card ═══════ */}
          <div className="p-col p-col-sun" data-node="1">
            <div className="p-zone">
              <div ref={planetSunRef} className="p-sphere p-sun" />
              <div className="p-connector" />
            </div>
            <div className="as-card as-card-light about-panel">
              <div className="as-card-cat">
                <ClubIcon name="Shield" className="as-card-cat-icon" />
                <span className="as-card-cat-label font-body">Leadership &amp; Vision</span>
              </div>
              <h3 className="font-display">A Message from the President</h3>
              {data?.presidentPhoto && (
                <div className="as-pres-photo">
                  <Image
                    src={urlFor(data.presidentPhoto).width(256).height(256).fit("crop").auto("format").url()}
                    alt="President Photo"
                    width={144}
                    height={144}
                    className="object-cover"
                  />
                </div>
              )}
              <p className="as-pres-quote font-body">
                &ldquo;{data?.presidentMessage || "Empowering the next generation of leaders through passion, service, and innovation."}&rdquo;
              </p>
              <div className="as-pres-footer font-body">NSS President</div>
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN: 3 outer planets + Our Vision card ═══════ */}
          <div className="p-col" data-node="2">
            <div className="p-zone">
              <div ref={planetMarsRef} className="p-sphere p-mars" />
              <div ref={planetJupiterRef} className="p-sphere p-jupiter" />
              <div ref={planetSaturnWrapRef} className="p-saturn-wrap">
                <div className="p-sphere p-saturn" />
                <div className="p-saturn-ring" />
              </div>
            </div>
            <div className="as-card as-card-dark about-panel">
              <div className="as-card-cat">
                <ClubIcon name="Heart" className="as-card-cat-icon" />
                <span className="as-card-cat-label font-body">Mission &amp; Purpose</span>
              </div>
              <h3 className="font-display">Our Vision</h3>
              <p className="as-card-body font-body">
                We envision a campus where creativity knows no boundaries, where a
                scientist can paint, a dancer can code, and a writer can score goals.
                NSS Clubs exist to blur the lines between disciplines.
              </p>
              <div className="as-card-stats">
                <div>
                  <div className="as-stat-label font-body">Clubs</div>
                  <div className="as-stat-value font-display">6</div>
                </div>
                <div>
                  <div className="as-stat-label font-body">Events/Year</div>
                  <div className="as-stat-value font-display">50+</div>
                </div>
                <div>
                  <div className="as-stat-label font-body">Impact</div>
                  <div className="as-stat-value font-display">1000+</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MOBILE TIMELINE LAYOUT ═══ */}
        <div className="solar-mobile">
          <div className="mob-spine" />

          {/* Sun at top */}
          <div className="mob-sun" />
          <div className="mob-connector" />

          {/* Card 1: Our Origin */}
          <div className="mob-card as-card as-card-dark about-panel" data-node="0">
            <div className="as-card-cat">
              <ClubIcon name="BookOpen" className="as-card-cat-icon" />
              <span className="as-card-cat-label font-body">History &amp; Heritage</span>
            </div>
            <h3 className="font-display">Our Origin</h3>
            <p className="as-card-body font-body">
              Founded in the heart of our institution, NSS Clubs began as a small
              group of passionate students with a shared dream — to create a vibrant
              community where every talent finds its stage.
            </p>
            <div className="as-card-stats">
              <div>
                <div className="as-stat-label font-body">Founded</div>
                <div className="as-stat-value font-display">2018</div>
              </div>
              <div>
                <div className="as-stat-label font-body">Founders</div>
                <div className="as-stat-value font-display">12</div>
              </div>
              <div>
                <div className="as-stat-label font-body">First Event</div>
                <div className="as-stat-value font-display">2019</div>
              </div>
            </div>
          </div>

          <div className="mob-connector" />
          <div className="mob-dot mob-dot-earth" />
          <div className="mob-connector" />

          {/* Card 2: President */}
          <div className="mob-card as-card as-card-light about-panel" data-node="1">
            <div className="as-card-cat">
              <ClubIcon name="Shield" className="as-card-cat-icon" />
              <span className="as-card-cat-label font-body">Leadership &amp; Vision</span>
            </div>
            <h3 className="font-display">A Message from the President</h3>
            {data?.presidentPhoto && (
              <div className="as-pres-photo">
                <Image
                  src={urlFor(data.presidentPhoto).width(256).height(256).fit("crop").auto("format").url()}
                  alt="President Photo"
                  width={144}
                  height={144}
                  className="object-cover"
                />
              </div>
            )}
            <p className="as-pres-quote font-body">
              &ldquo;{data?.presidentMessage || "Empowering the next generation of leaders through passion, service, and innovation."}&rdquo;
            </p>
            <div className="as-pres-footer font-body">NSS President</div>
          </div>

          <div className="mob-connector" />
          <div className="mob-dot mob-dot-jupiter" />
          <div className="mob-connector" />

          {/* Card 3: Our Vision */}
          <div className="mob-card as-card as-card-dark about-panel" data-node="2">
            <div className="as-card-cat">
              <ClubIcon name="Heart" className="as-card-cat-icon" />
              <span className="as-card-cat-label font-body">Mission &amp; Purpose</span>
            </div>
            <h3 className="font-display">Our Vision</h3>
            <p className="as-card-body font-body">
              We envision a campus where creativity knows no boundaries, where a
              scientist can paint, a dancer can code, and a writer can score goals.
              NSS Clubs exist to blur the lines between disciplines.
            </p>
            <div className="as-card-stats">
              <div>
                <div className="as-stat-label font-body">Clubs</div>
                <div className="as-stat-value font-display">6</div>
              </div>
              <div>
                <div className="as-stat-label font-body">Events/Year</div>
                <div className="as-stat-value font-display">50+</div>
              </div>
              <div>
                <div className="as-stat-label font-body">Impact</div>
                <div className="as-stat-value font-display">1000+</div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <div className="fixed inset-0 z-30 pointer-events-none" aria-hidden="true">
        {PLANET_DOT_MORPHS.map((morph, index) => (
          <div
            key={morph.key}
            ref={(el) => {
              morphGhostRefs.current[index] = el;
            }}
            className="absolute rounded-full"
            style={{
              opacity: 0,
              width: 0,
              height: 0,
              transform: "translate3d(0, 0, 0) scale(0.6)",
              willChange: "transform, width, height, opacity",
            }}
          />
        ))}
      </div>
    </>
  );
}