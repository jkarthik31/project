"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating elements animation
      gsap.to(".floating-element", {
        y: -30,
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 1,
          from: "random"
        }
      });

      // Title reveal animation
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 100,
          opacity: 0,
          duration: 1.5,
          ease: "expo.out",
          delay: 0.5
        });
      }

      // Parallax effect on scroll for floating elements
      gsap.to(".floating-element", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        },
        y: (i, target) => -200 * parseFloat(target.dataset.speed || "1"),
        ease: "none"
      });

      // Mouse follow glow effect
      const handleMouseMove = (e: MouseEvent) => {
        if (!glowRef.current) return;
        const { clientX, clientY } = e;
        gsap.to(glowRef.current, {
          x: clientX,
          y: clientY,
          duration: 1.2,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-600/15 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"
      />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-32 h-32 bg-blue-500/10 rounded-full floating-element blur-2xl" data-speed="0.2" />
        <div className="absolute top-[40%] right-[15%] w-48 h-48 bg-purple-500/10 rounded-full floating-element blur-3xl" data-speed="0.5" />
        <div className="absolute bottom-[20%] left-[25%] w-24 h-24 bg-indigo-500/10 rounded-full floating-element blur-xl" data-speed="0.3" />
        
        {/* Grid Lines Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-[0.2em] uppercase mb-8 backdrop-blur-md text-purple-400">
            Next-Gen Placement Ecosystem
          </span>
          <h1 ref={titleRef} className="text-6xl md:text-9xl font-bold tracking-tighter mb-10 leading-[0.9] text-white">
            Shape Your <br />
            <span className="text-gradient drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">Career Future</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-2xl text-gray-400/80 mb-14 leading-relaxed font-medium">
            Connect with industry leaders, manage departmental workflows, and 
            accelerate your professional journey in one intelligent, cinematic platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link
              href="http://localhost:5173/login?mode=signup"
              className="group relative px-10 py-5 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
            >
              <span className="relative z-10">Get Started Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
            <Link
              href="#jobs"
              className="group px-10 py-5 border border-white/20 bg-white/5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-500 hover:border-white/40"
            >
              Explore Jobs
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#030014] via-[#030014]/80 to-transparent z-10 pointer-events-none" />
    </section>
  );
}

