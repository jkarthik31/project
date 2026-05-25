"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatsData {
  totalStudents: number;
  totalCompanies: number;
  totalJobs: number;
  totalPlaced: number;
  totalDepts: number;
  successRate: number;
}

const CountUp = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/public-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  if (!stats) return null;

  const statItems = [
    { label: "Total Students", value: stats.totalStudents },
    { label: "Companies", value: stats.totalCompanies },
    { label: "Active Jobs", value: stats.totalJobs },
    { label: "Students Placed", value: stats.totalPlaced },
    { label: "Departments", value: stats.totalDepts },
    { label: "Success Rate", value: stats.successRate, suffix: "%" },
  ];

  return (
    <section id="stats" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
                <CountUp value={item.value} suffix={item.suffix} />
              </h3>
              <p className="text-gray-500 text-sm uppercase tracking-widest font-medium">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
