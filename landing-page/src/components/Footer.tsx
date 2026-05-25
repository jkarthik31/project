"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Code, Briefcase, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-24 bg-[#030014] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white mb-6 block">
              CAMPUS<span className="text-purple-500">NEXUS</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Empowering the next generation of professionals through intelligent 
              placement management and industry-aligned opportunities.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Code size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <MessageCircle size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Briefcase size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="#features" className="hover:text-purple-400 transition-colors">Features</Link></li>
              <li><Link href="#stats" className="hover:text-purple-400 transition-colors">Statistics</Link></li>
              <li><Link href="#roles" className="hover:text-purple-400 transition-colors">User Roles</Link></li>
              <li><Link href="#jobs" className="hover:text-purple-400 transition-colors">Job Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-purple-500" />
                <span>support@campusnexus.edu</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-blue-500" />
                <span>+1 (555) 000-0000</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-indigo-500" />
                <span>123 Innovation Drive, Tech City</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-gray-500 text-sm mb-6">
              Subscribe to get the latest job alerts and placement tips.
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 w-full"
              />
              <button className="bg-purple-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-gray-600">
          <p>© 2026 CampusNexus. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
