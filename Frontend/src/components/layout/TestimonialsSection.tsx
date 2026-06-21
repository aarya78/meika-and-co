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
          <span className="inline-flex items-center rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-pink-500 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.25em]">
            Customer Stories
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight sm:mt-8 sm:text-4xl md:text-7xl">
            Loved By Families
            <span className="block bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 bg-clip-text text-transparent">
              Across India
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-8 sm:text-lg sm:leading-8">
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

        <div className="mt-14 grid gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:mt-24 sm:gap-8 sm:rounded-[32px] sm:p-10 md:grid-cols-4">
          <div className="text-center">
            <h3 className="text-3xl font-bold sm:text-5xl">500+</h3>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
              Happy Customers
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold sm:text-5xl">4.9+</h3>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
              Average Rating
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold sm:text-5xl">100%</h3>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
              Handmade
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold sm:text-5xl">3+</h3>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
              Doll Collections
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
