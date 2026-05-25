"use client";

import { motion } from "framer-motion";
import { 
  Filter, 
  UserCheck, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  ClipboardList 
} from "lucide-react";

const features = [
  {
    title: "Dept-based Filtering",
    description: "Students only see opportunities relevant to their field of study, ensuring focused career paths.",
    icon: Filter,
    color: "blue"
  },
  {
    title: "HOD Approval System",
    description: "Secure and verified access control through departmental heads for all student activities.",
    icon: UserCheck,
    color: "purple"
  },
  {
    title: "Role-based Dashboards",
    description: "Customized interfaces for Students, Teachers, HODs, and Admins to manage their workflows.",
    icon: LayoutDashboard,
    color: "indigo"
  },
  {
    title: "Resume Management",
    description: "Built-in resume tracking and approval workflow to ensure quality applications.",
    icon: FileText,
    color: "blue"
  },
  {
    title: "Placement Analytics",
    description: "Comprehensive data visualization for tracking placement performance and company trends.",
    icon: BarChart3,
    color: "purple"
  },
  {
    title: "Application Tracking",
    description: "Real-time updates on application status from submission to final selection.",
    icon: ClipboardList,
    color: "indigo"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-[#030014] relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Powerful Features for <span className="text-gradient">Seamless Placements</span>
          </motion.h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform is built with modern tools to provide a smooth and efficient 
            experience for everyone involved in the placement process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="glass p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}-500/20 text-${feature.color}-400 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
              
              {/* Background Glow on Hover */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full group-hover:bg-purple-600/20 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
