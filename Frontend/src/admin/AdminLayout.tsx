"use client";

import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Package,
  Tags,
  PlusCircle,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  {
    title: "Products",
    icon: Package,
    path: "/admin/products",
  },
  {
    title: "Categories",
    icon: Tags,
    path: "/admin/categories",
  },
  {
    title: "Add Product",
    icon: PlusCircle,
    path: "/admin/add-product",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen bg-[#fdf6f0] text-[#2f241f]">
      <div className="flex min-h-screen">
        {/* ─── Desktop Sticky Sidebar ─── */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-[#eadfd6] bg-white/80 backdrop-blur-xl lg:flex">
          {/* Brand */}
          <div className="border-b border-[#eadfd6] px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef0e7] shadow-sm ring-1 ring-[#f5d6c3]">
                <Sparkles size={20} className="text-[#c96f4f]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2f241f]">
                  Meika Admin
                </h2>
                <p className="text-sm text-[#8a7668]">Product Management</p>
              </div>
            </div>
          </div>

          {/* Scrollable Nav Area */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b0a298]">
              Dashboard
            </p>

            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${isActive
                      ? "bg-[#fef0e7] text-[#c96f4f] shadow-sm ring-1 ring-[#f5d6c3]"
                      : "text-[#6A5D55] hover:bg-[#faf5f0] hover:text-[#2f241f]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isActive
                            ? "bg-white text-[#c96f4f] shadow-sm"
                            : "bg-[#f8efe8] text-[#8a7668] group-hover:bg-white"
                            }`}
                        >
                          <item.icon size={18} />
                        </div>
                        <span>{item.title}</span>
                      </div>

                      <ChevronRight
                        size={16}
                        className={`transition ${isActive
                          ? "translate-x-0 text-[#c96f4f]"
                          : "text-[#c4b5aa] group-hover:translate-x-0.5"
                          }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer Card — pinned to bottom */}
          <div className="shrink-0 border-t border-[#eadfd6] p-4">
            <div className="rounded-3xl bg-[#fdf6f0] p-4 ring-1 ring-[#eadfd6]">
              <p className="text-sm font-semibold text-[#4e3b31]">
                Manage your handmade collection
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8a7668]">
                Add, update and organize beautiful products for your store.
              </p>

              <button
                onClick={handleLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f241f] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1f1815]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Main Area ─── */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* Mobile Topbar */}
          <header className="sticky top-0 z-40 border-b border-[#eadfd6] bg-white/90 backdrop-blur-xl lg:hidden">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef0e7] ring-1 ring-[#f5d6c3]">
                  <Sparkles size={18} className="text-[#c96f4f]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#2f241f]">
                    Meika Admin
                  </h2>
                  <p className="text-xs text-[#8a7668]">Dashboard</p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfd6] bg-white text-[#4e3b31] shadow-sm transition active:scale-95"
              >
                <Menu size={18} />
              </button>
            </div>
          </header>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Overlay */}
                <motion.div
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Drawer */}
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  className="fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-[320px] flex-col border-r border-[#eadfd6] bg-white shadow-2xl lg:hidden"
                >
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-[#eadfd6] px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fef0e7] ring-1 ring-[#f5d6c3]">
                        <Sparkles size={18} className="text-[#c96f4f]" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#2f241f]">
                          Meika Admin
                        </h2>
                        <p className="text-xs text-[#8a7668]">
                          Product Management
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfd6] text-[#6A5D55] transition active:scale-95"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Drawer Nav — scrollable */}
                  <nav className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
                    <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b0a298]">
                      Dashboard
                    </p>

                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${isActive
                              ? "bg-[#fef0e7] text-[#c96f4f] shadow-sm ring-1 ring-[#f5d6c3]"
                              : "text-[#6A5D55] hover:bg-[#faf5f0] hover:text-[#2f241f]"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isActive
                                    ? "bg-white text-[#c96f4f] shadow-sm"
                                    : "bg-[#f8efe8] text-[#8a7668]"
                                    }`}
                                >
                                  <item.icon size={18} />
                                </div>
                                <span>{item.title}</span>
                              </div>

                              <ChevronRight
                                size={16}
                                className={`transition ${isActive
                                  ? "text-[#c96f4f]"
                                  : "text-[#c4b5aa]"
                                  }`}
                              />
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </nav>

                  {/* Drawer Footer — pinned */}
                  <div className="shrink-0 border-t border-[#eadfd6] p-4">
                    <div className="rounded-3xl bg-[#fdf6f0] p-4 ring-1 ring-[#eadfd6]">
                      <p className="text-sm font-semibold text-[#4e3b31]">
                        Keep your catalog updated
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#8a7668]">
                        Easily manage listings, pricing and categories.
                      </p>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* ─── Page Content ─── */}
          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
