"use client";

import { ArrowUpRight, Heart, Mail, MapPin, MessageCircle } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import { useSettings } from "@/contexts/SettingsContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const linkItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const quickLinks = [
  { label: "About Us", to: "/about", type: "route" },
  { label: "Collections", to: "/#collection", type: "anchor" },
  { label: "Testimonials", to: "/#testimonials", type: "anchor" },
  { label: "Contact", to: "/contact", type: "anchor" },
];

export function Footer() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  return (
    <footer className="relative overflow-hidden border-t border-[#eadfd6] bg-[#fdf6f0] text-[#4e3b31]">
      <motion.div
        className="absolute -top-24 left-0 h-56 w-56 rounded-full bg-[#f7d7c4]/40 blur-3xl sm:h-64 sm:w-64"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-10 h-60 w-60 rounded-full bg-[#f3c9d2]/30 blur-3xl sm:h-72 sm:w-72"
        animate={{
          x: [0, -25, 0],
          y: [0, 15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 text-center sm:gap-12 md:grid-cols-2 md:text-left lg:grid-cols-4">
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="mx-auto w-full max-w-sm md:mx-0"
          >
            <motion.span
              className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium tracking-wide text-[#b46b4e] shadow-sm ring-1 ring-[#eadfd6] sm:text-xs"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Handmade with love
            </motion.span>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#2f241f] sm:mt-4 sm:text-3xl">
              Meika
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-[#7b685d] sm:mt-4 sm:leading-7">
              Handmade dolls crafted with love, bringing warmth, comfort, and joy into every home.
            </p>

            <div className="mt-5 flex justify-center gap-3 md:justify-start sm:mt-6">
              <motion.a
                href={settings?.instagram_url ?? "#"}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#eadfd6] bg-white/80 p-2.5 text-[#6f5a4f] shadow-sm transition hover:border-[#d6b09b] hover:text-[#c96f4f] sm:p-3"
                whileHover={{ scale: 1.1, y: -3, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <FaInstagram size={17} />
              </motion.a>

              <motion.a
                href={settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}` : "#"}
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#eadfd6] bg-white/80 p-2.5 text-[#6f5a4f] shadow-sm transition hover:border-[#b9d7c0] hover:text-[#3a9b62] sm:p-3"
                whileHover={{ scale: 1.1, y: -3, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <MessageCircle size={17} />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <h3 className="text-sm font-semibold text-[#2f241f] sm:text-base">Collections</h3>

            <motion.ul
              className="mt-4 space-y-2.5 text-sm text-[#7b685d] sm:mt-5 sm:space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              {[
                "Mini Buddies",
                "Sleep Dino Collection",
                "Lazy Jungle Series",
                "Custom Dolls",
              ].map((item) => (
                <motion.li key={item} variants={linkItem}>
                  <motion.a
                    href="#"
                    className="group inline-flex items-center gap-1 transition hover:text-[#c96f4f]"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="line-clamp-1">{item}</span>
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </motion.a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <h3 className="text-sm font-semibold text-[#2f241f] sm:text-base">Quick Links</h3>

            <motion.ul
              className="mt-4 space-y-2.5 text-sm text-[#7b685d] sm:mt-5 sm:space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              {quickLinks.map((item) => (
                <motion.li key={item.label} variants={linkItem}>
                  {item.type === "route" ? (
                    <Link
                      to={item.to}
                      className="group inline-flex items-center gap-1 transition hover:text-[#c96f4f]"
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="inline-flex items-center gap-1"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight
                          size={13}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </motion.span>
                    </Link>
                  ) : (
                    <motion.a
                      href={item.to}
                      className="group inline-flex items-center gap-1 transition hover:text-[#c96f4f]"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </motion.a>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <h3 className="text-sm font-semibold text-[#2f241f] sm:text-base">Contact</h3>

            <motion.div
              className="mt-4 space-y-3.5 text-sm text-[#7b685d] sm:mt-5 sm:space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              {[
                { icon: MapPin, text: settings?.site_name ? settings.site_name : "Bhopal, India" },
                { icon: Mail, text: settings?.email ?? "" },
                { icon: MessageCircle, text: settings?.whatsapp_number ? "WhatsApp Inquiry" : "" },
              ]
                .filter((item) => item.text)
                .map(({ icon: Icon, text }) => (
                  <motion.div
                    key={text}
                    className="flex items-start justify-center gap-3 text-left md:justify-start"
                    variants={linkItem}
                  >
                    <motion.div
                      className="mt-0.5 rounded-full bg-white/80 p-2 shadow-sm ring-1 ring-[#eadfd6]"
                      whileHover={{
                        scale: 1.15,
                        rotate: 10,
                        boxShadow: "0 4px 15px rgba(180, 107, 78, 0.2)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Icon size={15} className="text-[#b46b4e]" />
                    </motion.div>
                    <motion.span
                      className="max-w-[16rem] break-words transition hover:text-[#c96f4f]"
                      whileHover={{ x: 3 }}
                    >
                      {text}
                    </motion.span>
                  </motion.div>
                ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="my-8 h-px bg-[#eadfd6] sm:my-10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          style={{ transformOrigin: "left" }}
        />

        <motion.div
          className="flex flex-col items-center justify-between gap-3 text-center text-xs text-[#8a7668] sm:gap-4 sm:text-sm md:flex-row md:text-left"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p onDoubleClick={() => navigate("/admin-login")} className="cursor-default">
            © {new Date().getFullYear()} Meika. All rights reserved.
          </p>

          <motion.p className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
            Made with
            <motion.span
              animate={{
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex"
            >
              <Heart className="h-4 w-4 fill-current text-[#e5869b]" />
            </motion.span>
            for doll lovers
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
}
