"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";

type Stat = {
  label: string;
  value: number;
  accent: string;
};

type Feature = {
  icon: string;
  title: string;
  description: string;
};

type LandingContentProps = {
  stats: Stat[];
  features: Feature[];
};

export function LandingContent({ stats, features }: LandingContentProps) {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-[#B91C1C]">
            Emergency Blood Coordination
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight text-[#0F172A] lg:text-6xl">
            When minutes matter,<br />
            <span className="text-[#B91C1C]">coordination saves lives.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#64748B]">
            A purpose-built workspace for hospitals to coordinate emergency blood needs and for donors to find exactly where they can help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-up"
                className="rounded-xl bg-[#B91C1C] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#991B1B]"
              >
                Join as hospital or donor →
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-in"
                className="rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] shadow-sm transition-colors hover:border-[#CBD5E1]"
              >
                Sign in to your workspace
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#E2E8F0] bg-white py-10">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <p className={`text-4xl font-bold ${stat.accent}`}>
                  <AnimatedCounter target={stat.value} />+
                </p>
                <p className="mt-1 text-sm text-[#64748B]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-[#0F172A]">Built for real emergencies</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-3 font-semibold text-[#0F172A]">{feature.title}</h3>
              <p className="mt-2 text-sm text-[#64748B]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
