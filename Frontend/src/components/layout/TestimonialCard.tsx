
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

export default function TestimonialCard({
    quote,
    name,
    location,
    featured,
    index,
}: {
    quote: string;
    name: string;
    location: string;
    featured?: boolean;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.6,
                delay: index * 0.08,
            }}
            whileHover={{
                y: -8,
            }}
            className="
                group
                relative
                h-[280px]
                overflow-hidden
                rounded-[24px]
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                p-5
                sm:h-[320px]
                sm:rounded-[32px]
                sm:p-8
                "
        >
            {/* Glow */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-pink-500/10 blur-3xl" />
            </div>

            {/* Quote Icon */}
            <Quote
                className="
          mb-5
          h-9
          w-9
          text-pink-500/70
          sm:mb-8
          sm:h-12
          sm:w-12
        "
            />

            {/* Stars */}
            <div className="mb-4 flex gap-1 sm:mb-6">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                ))}
            </div>

            {/* Quote */}
            <p
                className={`
          relative
          z-10
          line-clamp-5
          text-muted-foreground
          leading-6
          ${featured
                        ? "text-base sm:text-xl md:text-2xl"
                        : "text-sm sm:text-base md:text-lg"
                    }
        `}
            >
                "{quote}"
            </p>

            {/* Footer */}
            <div className="mt-6 sm:mt-10">
                <h4 className="text-base font-semibold sm:text-lg">
                    {name}
                </h4>

                <p className="text-xs text-muted-foreground sm:text-sm">
                    {location}
                </p>
            </div>
        </motion.div>
    );
}
