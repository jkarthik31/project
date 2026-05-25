"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import Features from "@/components/sections/Features";
import Roles from "@/components/sections/Roles";
import JobShowcase from "@/components/sections/JobShowcase";
import Footer from "@/components/Footer";

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === "A" || (e.target as HTMLElement).tagName === "BUTTON") {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <main className="relative bg-[#030014] selection:bg-purple-500/30">
      {/* Custom Cursor */}
      <motion.div
        className="hidden md:block custom-cursor"
        animate={{
          x: mousePos.x - 10,
          y: mousePos.y - 10,
          scale: isHovering ? 2.5 : 1,
          opacity: isHovering ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      />
      <motion.div
        className="hidden md:block custom-cursor-dot"
        animate={{
          x: mousePos.x - 2,
          y: mousePos.y - 2,
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 40, mass: 0.2 }}
      />

      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Roles />
      <JobShowcase />
      <Footer />
    </main>
  );
}
