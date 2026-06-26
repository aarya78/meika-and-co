import { motion } from "framer-motion";
import { Heart, Sparkles, Users } from "lucide-react";

interface AboutSectionProps { }

export default function AboutSection({ }: AboutSectionProps) {
    return (
        <section id="story" className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7 }}
                    className="text-center"
                >
                    {/* Section Badge */}
                    <div className="flex justify-center">
                        <span className="inline-block rounded-full bg-[#F6E6D7] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#D97757] sm:px-4 sm:text-xs">
                            OUR STORY
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h2 className="mt-5 mx-auto max-w-xl font-serif text-[2.2rem] font-semibold leading-[1.1] text-[#2D2D2D] sm:text-4xl md:text-5xl">
                        Welcome to Meika & Co 🤍
                    </h2>

                    {/* Founder Note Card (Text Only) */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        className="mt-10 mx-auto max-w-3xl px-4"
                    >
                        <div className="rounded-2xl border-l-4 border-[#D97757] bg-white p-5 shadow-md sm:p-8">

                            <div className="mt-4 space-y-4 text-base leading-8 text-[#6A5D55] sm:text-sm sm:leading-relaxed">
                                <p>
                                    I make things that feel like home — soft companions for little hands, and quiet statements for grown hearts. Each piece is made in small batches, with stitches placed by hand and colours chosen for calm.
                                </p>

                                <p>
                                    My hope is that these dolls hold stories: first hugs, sleepy prayers, tiny adventures. They are not just toys — they are reminders that care can be simple and beautiful.
                                </p>
                            </div>

                            <p className="mt-6 text-xl italic font-serif text-[#2D2D2D]">
                                With love,
                            </p>
                            <p className="mt-1 text-3xl italic font-serif tracking-wide text-[#2D2D2D]">
                                Meika
                            </p>
                        </div>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        className="mt-12 px-4"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 sm:gap-6 max-w-4xl mx-auto">
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="flex h-full flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
                            >
                                <Heart className="mb-3 text-[#D97757]" size={26} />
                                <h4 className="text-2xl font-semibold text-[#2D2D2D]">200+</h4>
                                <p className="mt-1 text-sm text-[#85736A]">Dolls Crafted</p>
                                <p className="hidden sm:block mt-3 text-xs text-[#9A8B80]">
                                    Each lovingly made in our studio
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="h-full rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center"
                            >
                                <Users className="mb-3 text-[#D97757]" size={26} />
                                <h4 className="text-2xl font-semibold text-[#2D2D2D]">50+</h4>
                                <p className="mt-1 text-sm text-[#85736A]">Happy Families</p>
                                <p className="hidden sm:block mt-3 text-xs text-[#9A8B80]">Grown-ups who chose handmade and heirloom quality</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="h-full rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center"
                            >
                                <Sparkles className="mb-3 text-[#D97757]" size={26} />
                                <h4 className="text-2xl font-semibold text-[#2D2D2D]">100%</h4>
                                <p className="mt-1 text-sm text-[#85736A]">Handmade</p>
                                <p className="hidden sm:block mt-3 text-xs text-[#9A8B80]">From first cut to final stitch</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}