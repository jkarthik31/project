"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Stats", href: "#stats" },
  { name: "Roles", href: "#roles" },
  { name: "Jobs", href: "#jobs" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-4 bg-[#030014]/80 backdrop-blur-md border-b border-white/10" : "py-6 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
          CAMPUS<span className="text-purple-500">NEXUS</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href="http://localhost:5173/login"
            className="text-sm font-bold text-white hover:text-purple-400 transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="http://localhost:5173/login?mode=signup"
            className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-purple-500 hover:text-white transition-all duration-300"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <button onClick={toggleTheme} className="p-2">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-[#030014] border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-gray-300"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="http://localhost:5173/login"
            className="w-full py-3 rounded-xl border border-white/10 text-white text-center font-bold"
          >
            Sign In
          </Link>
          <Link
            href="http://localhost:5173/login?mode=signup"
            className="w-full py-3 rounded-xl bg-purple-600 text-white text-center font-bold"
          >
            Sign Up
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
