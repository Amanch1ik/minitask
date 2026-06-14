import { useEffect, useState } from "react";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4";

/**
 * App-wide animated video background. Mounted once at the App root so every
 * screen (auth, board) shares the exact same backdrop.
 *
 *   - the video fills the viewport with `object-cover`, centred, so the figure
 *     stays framed and undistorted at any aspect ratio;
 *   - a light scrim sits on top so the UI reads as a light surface everywhere
 *     and dark text stays legible — same treatment on every screen.
 *
 * Under `prefers-reduced-motion` the video is dropped and only the static
 * surface colour remains (a media query cannot pause an autoplaying video).
 */
export default function VideoBackground() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-asana-bg"
      aria-hidden
    >
      {!reducedMotion && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center" }}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      )}

      {/* Light scrim — keeps the app readable and uniform over the video. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,250,250,0.72) 0%, rgba(250,250,250,0.60) 40%, rgba(250,250,250,0.60) 60%, rgba(250,250,250,0.78) 100%)",
        }}
      />
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
