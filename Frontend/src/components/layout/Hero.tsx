import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { heroSlides } from "@/data/heroSlides";

export default function Hero() {
    const [current, setCurrent] = useState(0);
    const { settings } = useSettings();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) =>
                prev === heroSlides.length - 1 ? 0 : prev + 1
            );
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section
            id="home"
            className="relative h-screen overflow-hidden"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={heroSlides[current].id}
                    initial={{
                        opacity: 0,
                        scale: 1.05,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 1.05,
                    }}
                    transition={{
                        duration: 1.4,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0"
                >
                    <img
                        src={heroSlides[current].image}
                        alt={heroSlides[current].title}
                        className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/30" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 flex h-full items-center">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroSlides[current].title}
                            initial={{
                                opacity: 0,
                                y: 40,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -20,
                            }}
                            transition={{
                                duration: 0.8,
                            }}
                            className="max-w-3xl"
                        >
                            <span
                                className="
                mb-4
                inline-block
                rounded-full
                bg-white/10
                px-4
                py-2
                text-sm
                text-white
                backdrop-blur-md
              "
                            >
                                Handmade Fabric Dolls
                            </span>

                            <h1
                                className="
                mb-6
                font-serif
                text-5xl
                font-semibold
                leading-tight
                text-white
                md:text-7xl
              "
                            >
                                {heroSlides[current].title}
                            </h1>

                            <p
                                className="
                mb-8
                max-w-xl
                text-lg
                text-white/90
              "
                            >
                                {heroSlides[current].subtitle}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="#collection"
                                    className="
                    rounded-full
                    bg-[#D97757]
                    px-8
                    py-4
                    text-white
                    transition
                    hover:scale-105
                  "
                                >
                                    Explore Collection
                                </a>

                                <a
                                    href={settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}` : "#"}
                                    className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/30
                    bg-white/10
                    px-8
                    py-4
                    text-white
                    backdrop-blur-md
                  "
                                >
                                    <MessageCircle size={18} />
                                    WhatsApp Inquiry
                                </a>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}