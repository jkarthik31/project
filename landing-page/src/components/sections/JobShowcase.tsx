"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Building2, Briefcase, IndianRupee, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

interface Job {
  id: number;
  title: string;
  company: string;
  package: string;
  allowed_departments: string;
  eligibility_criteria: string;
  deadline: string;
}

export default function JobShowcase() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/public-jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section id="jobs" className="py-24 bg-[#030014]/50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Latest <span className="text-gradient">Opportunities</span>
            </motion.h2>
            <p className="text-gray-400">
              Explore recently posted jobs from top companies.
            </p>
          </div>
          <Link 
            href="http://localhost:5173/jobs"
            className="hidden md:block px-6 py-2 border border-white/10 rounded-full text-sm font-bold hover:bg-white/5 transition-all"
          >
            View All Jobs
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 glass rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                    <Building2 className="text-gray-400 group-hover:text-purple-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider">
                    Active
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
                  <Briefcase size={14} /> {job.company}
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <IndianRupee size={16} className="text-purple-500" />
                    <span>{job.package}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Calendar size={16} className="text-blue-500" />
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {job.allowed_departments.split(",").slice(0, 3).map((dept, i) => (
                    <span key={i} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-gray-400 border border-white/5">
                      {dept.trim()}
                    </span>
                  ))}
                </div>

                <Link
                  href={`http://localhost:5173/login`}
                  className="block w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center text-sm font-bold hover:bg-white text-black transition-all"
                >
                  Apply Now
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link 
            href="http://localhost:5173/jobs"
            className="inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-full text-sm font-bold"
          >
            View All Jobs
          </Link>
        </div>
      </div>
    </section>
  );
}
