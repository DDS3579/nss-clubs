import Link from "next/link";
import type { CSSProperties } from "react";

const FOOTER_LINKS = [
  { label: "Explore Clubs", href: "/#clubs" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/#gallery" },
  { label: "About", href: "/#about" },
];

export default function ConstellationFooter() {
  return (
    <footer id="constellation-footer" className="font-body" aria-labelledby="footer-title">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #constellation-footer {
              position: relative;
              overflow: hidden;
              background: linear-gradient(180deg, #ffffff 0%, #f8fafc 45%, #eef3f9 100%);
              border-top: 1px solid rgba(13, 36, 96, 0.08);
              color: #0d2460;
              padding: 72px 20px 34px;
            }

            #constellation-footer .cf-field {
              position: absolute;
              inset: 0;
              pointer-events: none;
            }

            #constellation-footer .cf-field svg {
              width: 100%;
              height: 100%;
              opacity: 0.72;
            }

            #constellation-footer .cf-line {
              stroke: rgba(26, 51, 120, 0.12);
              stroke-width: 0.8;
            }

            #constellation-footer .cf-star {
              animation: cf-twinkle var(--twinkle-duration) ease-in-out infinite;
              opacity: var(--star-opacity);
              transform-origin: center;
              transform-box: fill-box;
            }

            #constellation-footer .cf-inner {
              position: relative;
              z-index: 1;
              width: min(100%, 1040px);
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 36px;
            }

            #constellation-footer .cf-brand {
              max-width: 360px;
            }

            #constellation-footer h2 {
              margin: 0;
              color: #0d2460;
              font-size: clamp(30px, 4vw, 44px);
              font-weight: 900;
              line-height: 1;
            }

            #constellation-footer p {
              margin: 12px 0 0;
              color: #64748b;
              font-size: 14px;
              line-height: 1.7;
            }

            #constellation-footer nav {
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-end;
              gap: 10px 22px;
            }

            #constellation-footer a {
              color: #0d2460;
              font-size: 14px;
              font-weight: 800;
              text-decoration: none;
              transition: color 180ms ease, opacity 180ms ease;
            }

            #constellation-footer a:hover,
            #constellation-footer a:focus-visible {
              color: #c8903a;
            }

            #constellation-footer a:focus-visible {
              outline: 2px solid rgba(200, 144, 58, 0.7);
              outline-offset: 5px;
              border-radius: 4px;
            }

            #constellation-footer .cf-bottom {
              position: relative;
              z-index: 1;
              width: min(100%, 1040px);
              margin: 42px auto 0;
              padding-top: 20px;
              border-top: 1px solid rgba(13, 36, 96, 0.08);
              color: #94a3b8;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.04em;
              text-transform: uppercase;
            }

            @keyframes cf-twinkle {
              0%, 100% {
                opacity: var(--star-opacity);
                transform: scale(1);
              }
              50% {
                opacity: calc(var(--star-opacity) * 0.42);
                transform: scale(0.82);
              }
            }

            @media (max-width: 720px) {
              #constellation-footer {
                padding-top: 56px;
              }

              #constellation-footer .cf-inner {
                align-items: flex-start;
                flex-direction: column;
                gap: 28px;
              }

              #constellation-footer nav {
                justify-content: flex-start;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              #constellation-footer .cf-star {
                animation: none;
              }
            }
          `,
        }}
      />

      <div className="cf-field" aria-hidden="true">
        <svg viewBox="0 0 1000 320" preserveAspectRatio="none">
          <line className="cf-line" x1="90" y1="76" x2="246" y2="134" />
          <line className="cf-line" x1="246" y1="134" x2="392" y2="78" />
          <line className="cf-line" x1="702" y1="86" x2="842" y2="148" />
          <line className="cf-line" x1="842" y1="148" x2="912" y2="76" />
          <line className="cf-line" x1="612" y1="236" x2="760" y2="196" />

          <circle className="cf-star" cx="90" cy="76" r="2.8" fill="#1a3378" style={{ "--twinkle-duration": "10s", "--star-opacity": 0.34 } as CSSProperties} />
          <circle className="cf-star" cx="246" cy="134" r="1.8" fill="#1a3378" style={{ "--twinkle-duration": "13s", "--star-opacity": 0.26 } as CSSProperties} />
          <circle className="cf-star" cx="392" cy="78" r="2.2" fill="#c8903a" style={{ "--twinkle-duration": "8s", "--star-opacity": 0.42 } as CSSProperties} />
          <circle className="cf-star" cx="702" cy="86" r="2" fill="#1a3378" style={{ "--twinkle-duration": "12s", "--star-opacity": 0.3 } as CSSProperties} />
          <circle className="cf-star" cx="842" cy="148" r="2.5" fill="#1a3378" style={{ "--twinkle-duration": "9s", "--star-opacity": 0.32 } as CSSProperties} />
          <circle className="cf-star" cx="912" cy="76" r="1.8" fill="#c8903a" style={{ "--twinkle-duration": "11s", "--star-opacity": 0.34 } as CSSProperties} />
          <circle className="cf-star" cx="612" cy="236" r="1.7" fill="#1a3378" style={{ "--twinkle-duration": "13s", "--star-opacity": 0.24 } as CSSProperties} />
          <circle className="cf-star" cx="760" cy="196" r="2.1" fill="#1a3378" style={{ "--twinkle-duration": "10s", "--star-opacity": 0.28 } as CSSProperties} />
        </svg>
      </div>

      <div className="cf-inner">
        <div className="cf-brand">
          <h2 id="footer-title" className="font-display">NSS Clubs</h2>
          <p>
            The journey keeps expanding through curiosity, service, creativity, and student leadership.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="cf-bottom">
        Copyright {new Date().getFullYear()} NSS Clubs. All rights reserved.
      </div>
    </footer>
  );
}
