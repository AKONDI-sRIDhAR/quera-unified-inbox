import { ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MagicBentoProps {
  children: ReactNode;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  textAutoHide?: boolean;
  glowColor?: string;
  spotlightRadius?: number;
  starCount?: number;
}

export const MagicBento = ({
  children,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  textAutoHide = true,
  glowColor = "132, 0, 255",
  spotlightRadius = 300,
  starCount = 12,
}: MagicBentoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enableSpotlight || !containerRef.current || !spotlightRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current) return;
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      spotlightRef.current.style.background = `radial-gradient(circle ${spotlightRadius}px at ${x}px ${y}px, rgba(${glowColor}, 0.08), transparent)`;
    };

    containerRef.current.addEventListener("mousemove", handleMouseMove);
    return () => {
      containerRef.current?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [enableSpotlight, glowColor, spotlightRadius]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {enableSpotlight && (
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute inset-0 z-10"
        />
      )}

      {enableStars && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: starCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-20">
        {enableBorderGlow ? (
          <motion.div
            whileHover={enableTilt ? { rotateX: 1, rotateY: 1 } : undefined}
            className={`rounded-lg ${
              enableBorderGlow
                ? "shadow-[0_0_20px_rgba(var(--glow-color),0.15)]"
                : ""
            }`}
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
