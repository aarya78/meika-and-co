"use client";

import { testimonials } from "@/data/testimonials ";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden pb-14 sm:pb-20"
    >
      <div className="absolute inset-0">
        <div className="absolute left-0 top-20 h-[360px] w-[360px] rounded-full bg-pink-500/10 blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[140px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-4xl text-center sm:mb-24">
          <span className="inline-flex C rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-pink-500 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.25em]">
            Customer Stories
          </span>

          <h2 className="mt-5 text-md font-bold leading-tight sm:mt-8 sm:text-md md:text-5xl">
            Loved By Families
            <span className="block bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 bg-clip-text text-transparent">
              Across India
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-8 sm:text-md sm:leading-8">
            Every stitch carries a little love. Here’s what families say after
            welcoming Meika dolls into their homes.
          </p>
        </div>

        <div className="mt-10 flex justify-center sm:mt-20">
          <div className="w-full max-w-16xl overflow-hidden">
            <InfiniteMovingCards
              items={testimonials}
              direction="left"
              speed="slow"
              pauseOnHover
            />
          </div>
        </div>
      </div>
    </section>
  );
}
