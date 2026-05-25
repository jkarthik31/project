"use client";

import { motion } from "framer-motion";
import { User, Users, ShieldCheck, Settings } from "lucide-react";

const roles = [
  {
    title: "Student",
    icon: User,
    features: ["View only own department jobs", "Apply to eligible positions", "Manage personal profile"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Teacher",
    icon: Users,
    features: ["Manage own department students", "View placement progress", "Verify student data"],
    color: "from-purple-500 to-indigo-500"
  },
  {
    title: "HOD",
    icon: ShieldCheck,
    features: ["Approve department logins", "Change job status for department", "Manage staff and students"],
    color: "from-indigo-500 to-blue-500"
  },
  {
    title: "Admin",
    icon: Settings,
    features: ["Full system access", "Manage all departments", "Company & Job management"],
    color: "from-purple-600 to-pink-600"
  }
];

export default function Roles() {
  return (
    <section id="roles" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Precision <span className="text-gradient">Access Control</span>
            </motion.h2>
            <p className="text-gray-400 mb-8 text-lg">
              CampusNexus features a sophisticated role-based access control system 
              ensuring data security and departmental autonomy.
            </p>
            <div className="space-y-6">
              {roles.map((role, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className={`mt-1 p-2 rounded-lg bg-gradient-to-br ${role.color} bg-opacity-10`}>
                    <role.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{role.title}</h4>
                    <ul className="text-gray-500 text-sm mt-1">
                      {role.features.map((f, i) => (
                        <li key={i} className="inline-block mr-4">• {f}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 glass p-4 rounded-[2rem]"
            >
              <div className="bg-[#030014] rounded-[1.5rem] p-8 overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20" />
                  <div className="space-y-2">
                    <div className="w-32 h-3 bg-white/10 rounded" />
                    <div className="w-20 h-2 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-full h-32 bg-white/5 rounded-xl animate-pulse" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-white/5 rounded-xl" />
                    <div className="h-20 bg-white/5 rounded-xl" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-600/10 blur-[100px] rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
