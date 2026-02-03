"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, TrendingUp, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    school: "Westminster School",
    avatar: "SC",
    grade: { before: "C", after: "A*" },
    text: "The AI feedback helped me understand exactly where I was losing marks. My evaluation skills improved dramatically.",
    subject: "Unit 4",
    color: "from-sky-400 to-sky-600",
  },
  {
    id: 2,
    name: "James Okonkwo",
    school: "Eton College",
    avatar: "JO",
    grade: { before: "B", after: "A*" },
    text: "The essay planner is a game-changer. I finally understand how to structure 25-mark questions properly.",
    subject: "Unit 3",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    id: 3,
    name: "Priya Sharma",
    school: "NLCS",
    avatar: "PS",
    grade: { before: "D", after: "A" },
    text: "I went from struggling with chains of reasoning to getting full marks on analysis. The detailed breakdowns are incredible.",
    subject: "Unit 2",
    color: "from-violet-400 to-violet-600",
  },
  {
    id: 4,
    name: "Tom Williams",
    school: "Harrow School",
    avatar: "TW",
    grade: { before: "C", after: "A" },
    text: "The diagram suggestions and evaluation techniques pushed my essays to Level 5. My teacher was amazed.",
    subject: "Unit 4",
    color: "from-amber-400 to-amber-600",
  },
];

// Single testimonial card
function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative"
    >
      <div className="relative h-full p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Quote icon */}
        <div className="absolute -top-3 -left-2">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
            <Quote className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* Grade improvement badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-sm font-semibold shadow-sm",
                testimonial.color
              )}
            >
              {testimonial.avatar}
            </div>
            <div>
              <h4 className="text-sm font-medium text-stone-800">
                {testimonial.name}
              </h4>
              <p className="text-xs text-stone-400">{testimonial.school}</p>
            </div>
          </div>

          {/* Grade change */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="text-xs font-medium text-stone-500">
              {testimonial.grade.before}
            </span>
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600">
              {testimonial.grade.after}
            </span>
          </div>
        </div>

        {/* Testimonial text */}
        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400">
            {testimonial.subject}
          </span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stats component
function StatCard({
  value,
  label,
  icon: Icon,
  delay,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="text-center p-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-stone-500" />
      </div>
      <div className="text-2xl font-light text-stone-800 mb-1">{value}</div>
      <div className="text-xs text-stone-400">{label}</div>
    </motion.div>
  );
}

// Main testimonials section
export function TestimonialsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-light text-stone-800 mb-3">
            Trusted by A* Students
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Join thousands of Edexcel Economics students who improved their
            grades with AI-powered feedback
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center items-center gap-8 md:gap-16 mb-12 py-6 px-8 rounded-2xl bg-stone-50/50 border border-stone-100"
        >
          <StatCard
            value="94%"
            label="Grade Improvement"
            icon={TrendingUp}
            delay={0.2}
          />
          <div className="w-px h-12 bg-stone-200" />
          <StatCard
            value="10k+"
            label="Essays Graded"
            icon={GraduationCap}
            delay={0.3}
          />
          <div className="w-px h-12 bg-stone-200 hidden md:block" />
          <div className="hidden md:block">
            <StatCard
              value="4.9"
              label="Average Rating"
              icon={Star}
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-xs text-stone-400">
            Real results from real students. Start improving your grades today.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Compact testimonial marquee for landing pages
export function TestimonialMarquee() {
  return (
    <div className="relative overflow-hidden py-8">
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40,
            ease: "linear",
          },
        }}
        className="flex gap-6"
      >
        {[...testimonials, ...testimonials, ...testimonials].map(
          (testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0 w-80 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-stone-200/40"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-semibold",
                    testimonial.color
                  )}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-medium text-stone-700">
                    {testimonial.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-400">
                      {testimonial.grade.before}
                    </span>
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-600">
                      {testimonial.grade.after}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2">
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </div>
          )
        )}
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[hsl(var(--background))] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[hsl(var(--background))] to-transparent pointer-events-none" />
    </div>
  );
}
