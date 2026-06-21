import { motion } from "framer-motion";
import { Heart, Sparkles, Users } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface AboutSectionProps {
    founderImage: string;
}

export default function AboutSection({
    founderImage,
}: AboutSectionProps) {
    return (
        <section
            id="story"
            className="min-h-[100svh] flex items-center"
        >
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Content */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -40,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.7,
                        }}
                    >
                        <span
                            className="
                                mb-4
                                inline-block
                                rounded-full
                                bg-[#F6E6D7]
                                px-4
                                py-2
                                text-xs
                                font-medium
                                uppercase
                                tracking-[0.25em]
                                text-[#D97757]
                            "
                        >
                            Our Story
                        </span>

                        <h2
                            className="
                                mb-6
                                font-serif
                                text-2xl
                                font-semibold
                                leading-tight
                                text-[#2D2D2D]
                                lg:text-6xl
                            "
                        >
                            Welcome to Meika & Co 🤍
                            
                        </h2>

                        <p className="mb-5 text-lg leading-relaxed text-[#6A5D55]">
                            A world of handcrafted fabric toys, dolls, and keepsakes designed to make childhood a little softer and a lot more magical.
                        </p>

                        <p className="mb-10 text-lg leading-relaxed text-[#6A5D55]">
                            Every creation is stitched with care using natural fabrics and thoughtful details, making each piece unique—just like the little ones who love them.
                        </p>

                        <p className="mb-10 text-lg leading-relaxed text-[#6A5D55]">
                            Thank you for being here and supporting handmade. ✨
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <Heart
                                    className="mb-3 text-[#D97757]"
                                    size={22}
                                />

                                <h3 className="text-2xl font-semibold">
                                    200+
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Dolls Crafted
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <Users
                                    className="mb-3 text-[#D97757]"
                                    size={22}
                                />

                                <h3 className="text-2xl font-semibold">
                                    50+
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Happy Families
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <Sparkles
                                    className="mb-3 text-[#D97757]"
                                    size={22}
                                />

                                <h3 className="text-2xl font-semibold">
                                    100%
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Handmade
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Founder Image */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 40,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.7,
                        }}
                        className="relative"
                    >
                        <div className="relative rounded-[32px] p-[2px]">
                            <GlowingEffect
                                spread={80}
                                glow
                                disabled={false}
                                proximity={120}
                                inactiveZone={0.1}
                                borderWidth={3}
                            />

                            <div
                                className="
                                    relative
                                    overflow-hidden
                                    rounded-[28px]
                                "
                            >
                                <img
                                    src={founderImage}
                                    alt="Founder"
                                    className="h-[300px] w-full object-cover lg:h-[400px]"
                                />

                                <div
                                    className="
                                        absolute
                                        inset-x-0
                                        bottom-0
                                        bg-gradient-to-t
                                        from-black/60
                                        to-transparent
                                        p-8
                                    "
                                >
                                    <h3 className="text-2xl text-white">
                                        Meika Founder
                                    </h3>

                                    <p className="text-white/80">
                                        Handmade Artist & Creator
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}