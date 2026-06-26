import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Gift,
  Heart,
  Home,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Quote,
} from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSettings } from "@/contexts/SettingsContext";

import logo from "@/assets/logo.png";

type NavItem =
  | {
    label: string;
    href: string;
    icon: typeof Home;
    kind: "route";
  }
  | {
    label: string;
    href: string;
    icon: typeof Home;
    kind: "section";
    sectionId: string;
  };

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    kind: "route",
  },
  {
    label: "Our Story",
    href: "/about",
    icon: Heart,
    kind: "route",
  },
  {
    label: "Collection",
    href: "/products",
    icon: Gift,
    kind: "route"
  },
  {
    label: "Testimonials",
    href: "/#testimonials",
    icon: Quote,
    kind: "section",
    sectionId: "testimonials",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail,
    kind: "route",
  },
];

function normalizeWhatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const whatsappUrl = useMemo(() => {
    if (!settings?.whatsapp_number) {
      return "#";
    }

    const normalized = normalizeWhatsappNumber(settings.whatsapp_number);
    return normalized ? `https://wa.me/${normalized}` : "#";
  }, [settings?.whatsapp_number]);

  const handleNavClick = (item: NavItem) => {
    setIsMobileMenuOpen(false);

    if (item.kind === "route") {
      navigate(item.href);
      return;
    }

    if (location.pathname === "/") {
      const element = document.getElementById(item.sectionId);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }
    }

    navigate(item.href);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled
          ? "border-b border-black/5 bg-[#FFF9F5]/80 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to="/" className="group flex flex-col">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Meika Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const isActive = item.kind === "route" && location.pathname === item.href;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`group relative text-sm font-medium transition ${isActive ? "text-[#D97757]" : "text-[#2D2D2D]"
                  }`}
              >
                {item.label}

                <span
                  className={`absolute -bottom-2 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-[#D97757] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                />
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <motion.a
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#D97757] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#D97757]/20 transition-colors hover:bg-[#c96b4f]"
          >
            <MessageCircle size={18} />
            WhatsApp Inquiry
          </motion.a>
        </div>

        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open Menu"
                className="rounded-full p-2 transition hover:bg-black/5"
              >
                <Menu size={24} />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[360px] overflow-y-auto border-l border-[#E8DDD7] bg-[#FFF9F5] px-8 py-8"
            >
              <div className="flex min-h-full flex-col">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-10 border-b border-[#E8DDD7] pb-8"
                >
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                    <span className="text-xl text-[#D97757]">✦</span>

                    <div>
                      <h2 className="font-serif text-4xl font-semibold tracking-wide text-[#2D2D2D]">
                        MEIKA
                      </h2>

                      <p className="mt-1 text-[11px] uppercase tracking-[0.35em] text-[#8A7B73]">
                        Handmade Fabric Dolls
                      </p>
                    </div>
                  </Link>
                </motion.div>

                <motion.nav
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                  className="space-y-2"
                >
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.kind === "route" && location.pathname === item.href;

                    return (
                      <motion.button
                        key={item.label}
                        type="button"
                        variants={{
                          hidden: {
                            opacity: 0,
                            x: 20,
                          },
                          visible: {
                            opacity: 1,
                            x: 0,
                          },
                        }}
                        whileHover={{ x: 6 }}
                        onClick={() => handleNavClick(item)}
                        className={`group flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-all ${isActive ? "bg-[#F8EFE9]" : "hover:bg-[#F8EFE9]"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <Icon size={22} className="text-[#B5838D]" />

                          <span className="text-lg font-medium text-[#2D2D2D]">{item.label}</span>
                        </div>

                        <span
                          className={`text-[#D97757] transition ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                        >
                          ✦
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.nav>

                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 flex items-center justify-center gap-3 rounded-full bg-[#D97757] py-3 text-md font-semibold text-white shadow-xl shadow-[#D97757]/20"
                >
                  <MessageCircle />
                  WhatsApp Inquiry
                </motion.a>

                <div className="my-10 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#E8DDD7]" />
                  <span className="text-[#D97757]">❤</span>
                  <div className="h-px flex-1 bg-[#E8DDD7]" />
                </div>

                <div>
                  <h3 className="mb-6 font-serif text-2xl text-[#5A463E]">Get in Touch</h3>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <Phone size={18} className="text-[#D97757]" />
                      <span>{settings?.whatsapp_number ?? ""}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Mail size={18} className="text-[#D97757]" />
                      <span>{settings?.email ?? ""}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <MapPin size={18} className="text-[#D97757]" />
                      <span>{settings?.site_name || "Meika Doll Shop"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <h4 className="mb-5 text-lg font-medium">Follow Us</h4>

                  <div className="flex gap-4">
                    <a
                      href={settings?.facebook_url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-[#F8EFE9] p-3 transition hover:scale-110"
                    >
                      <FaFacebook size={20} />
                    </a>

                    <a
                      href={settings?.instagram_url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-[#F8EFE9] p-3 transition hover:scale-110"
                    >
                      <FaInstagram size={20} />
                    </a>
                  </div>
                </div>

                <div className="mt-auto pb-12 pt-10 text-center">
                  <p className="text-xs text-muted-foreground">© 2026 Meika Doll Shop</p>
                  <p className="mt-2 text-xs text-muted-foreground">Crafted with love & creativity</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
