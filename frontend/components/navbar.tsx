"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faServer,
  faTrophy,
  faUser,
  faTimes,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useUser } from "../lib/user-context";
import LoginModal from "./login-modal";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { user, login, logout } = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [extraDropdownOpen, setExtraDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const extraDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node) &&
        extraDropdownRef.current &&
        !extraDropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setExtraDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setDropdownOpen(false);
    setExtraDropdownOpen(false);
  }, [pathname]);

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setExtraDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close other dropdowns when one opens
  const handleUserDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) setExtraDropdownOpen(false);
  };

  const handleExtraDropdownToggle = () => {
    setExtraDropdownOpen(!extraDropdownOpen);
    if (!extraDropdownOpen) setDropdownOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/rankings", label: "Rankings" },
    { href: "/servers", label: "Servers" },
  ];

  const mobileNavLinks = [
    { href: "/", label: "Home", icon: faHome },
    { href: "/rankings", label: "Rankings", icon: faTrophy },
    { href: "/servers", label: "Servers", icon: faServer },
  ];

  const linkIsActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  const handleLogin = (username: string) => {
    login(username);
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 dark:bg-dark-navy/95 border-b border-gray-200/50 dark:border-slate-700/50 shadow-sm">
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="transition-all duration-300"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <span className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent animate-rgb bg-[length:200%_auto]">
              MineNepal
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative text-sm font-semibold transition-all duration-200 py-1",
                  linkIsActive(link.href)
                  ? "text-coffee dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-coffee dark:hover:text-white"
                )}
              >
                {link.label}
                {linkIsActive(link.href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-coffee dark:bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            
            {/* Extra Dropdown */}
            <div className="relative" ref={extraDropdownRef}>
              <button
                onClick={handleExtraDropdownToggle}
                onMouseEnter={() => setExtraDropdownOpen(true)}
                type="button"
                className={clsx(
                  "relative text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 py-1",
                  extraDropdownOpen
                    ? "text-coffee dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-coffee dark:hover:text-white"
                )}
              >
                Extra
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={clsx(
                    "h-3 w-3 transition-transform duration-200",
                    extraDropdownOpen && "rotate-180"
                  )} 
                />
              </button>
              <AnimatePresence>
                {extraDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onMouseLeave={() => setExtraDropdownOpen(false)}
                    className="absolute right-0 mt-3 w-52 rounded-xl bg-white/95 dark:bg-dark-navy/95 backdrop-blur-md shadow-2xl border border-gray-200/80 dark:border-slate-700/80 overflow-hidden z-50"
                  >
                    <div className="py-2">
                    <a
                      href="https://app.minenepal.xyz/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setExtraDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-coffee/10 dark:hover:bg-white/10 hover:text-coffee dark:hover:text-white"
                    >
                      Forums
                    </a>
                    <a
                      href="https://app.minenepal.xyz/resources/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setExtraDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-coffee/10 dark:hover:bg-white/10 hover:text-coffee dark:hover:text-white"
                    >
                      Marketplace
                    </a>
                    <a
                      href="https://app.minenepal.xyz/news/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setExtraDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-coffee/10 dark:hover:bg-white/10 hover:text-coffee dark:hover:text-white"
                    >
                      News
                    </a>
                    <a
                      href="http://explore.minenepal.xyz/events"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setExtraDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-coffee/10 dark:hover:bg-white/10 hover:text-coffee dark:hover:text-white"
                    >
                      Events
                    </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <ThemeToggle />

            {/* User Section - Desktop */}
            {user ? (
              <button
                onClick={() => setModalOpen(true)}
                type="button"
                className="group flex cursor-pointer items-center space-x-2 rounded-md bg-[#8c502e] border-b-4 border-[#632811] px-4 py-1 font-bold uppercase text-white shadow-none transition-transform duration-200 hover:scale-95"
              >
                <Image
                  src={`https://mc-heads.net/head/${user.username}`}
                  alt={user.username}
                  className="h-8 w-8 rounded object-cover scale-100 transition-all duration-200 group-hover:scale-95"
                  width={32}
                  height={32}
                  unoptimized
                />
                <span className="text-base font-bold text-white hidden xl:block">
                  {user.username}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-2xl xl:text-base"
                />
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                type="button"
                className="group flex cursor-pointer items-center space-x-2 rounded-md bg-[#8c502e] border-b-4 border-[#632811] px-4 py-1 font-bold uppercase text-white shadow-none transition-transform duration-200 hover:scale-95"
              >
                <Image
                  src="https://mc-heads.net/head/steve"
                  alt="Sign in"
                  className="h-8 w-8 rounded object-cover scale-100 transition-all duration-200 group-hover:scale-95"
                  width={32}
                  height={32}
                  unoptimized
                />
                <p className="hidden text-lg xl:block">Sign in</p>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="block text-2xl xl:hidden"
                />
              </button>
            )}
          </div>

          {/* Mobile user section */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => setModalOpen(true)}
                type="button"
                className="group flex cursor-pointer items-center space-x-2 rounded-md bg-[#8c502e] border-b-4 border-[#632811] px-3 py-1 text-base font-bold uppercase text-white shadow-none transition-transform duration-200 hover:scale-95"
              >
                <Image
                  src={`https://mc-heads.net/head/${user.username}`}
                  alt={user.username}
                  className="h-8 w-8 rounded object-cover scale-100 transition-all duration-200 group-hover:scale-95"
                  width={32}
                  height={32}
                  unoptimized
                />
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-xl"
                />
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                type="button"
                className="group flex cursor-pointer items-center space-x-2 rounded-md bg-[#8c502e] border-b-4 border-[#632811] px-3 py-1 text-base font-bold uppercase text-white shadow-none transition-transform duration-200 hover:scale-95"
              >
                <Image
                  src="https://mc-heads.net/head/steve"
                  alt="Sign in"
                  className="h-8 w-8 rounded object-cover scale-100 transition-all duration-200 group-hover:scale-95"
                  width={32}
                  height={32}
                  unoptimized
                />
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-xl"
                />
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onLogin={handleLogin}
        user={user}
        onLogout={logout}
      />
    </header>

    {/* Mobile Bottom Navbar */}
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 dark:border-neutral-800/50 bg-white dark:bg-dark-navy shadow-2xl md:hidden">
      <div className="flex h-16 w-full items-center justify-around px-1">
        {mobileNavLinks.map((link) => {
          const active = linkIsActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-1 flex-col items-center justify-center text-[11px] font-medium transition-all duration-200 active:scale-95 relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center w-full"
              >
                <FontAwesomeIcon
                  icon={link.icon}
                  className={clsx(
                    "mb-1 h-6 w-6 transition-all duration-200",
                    active ? "text-coffee dark:text-white scale-110" : "text-gray-600 dark:text-gray-400"
                  )}
                />
                <span
                  className={clsx(
                    "transition-all duration-200",
                    active ? "text-coffee dark:text-white font-bold" : "text-gray-600/80 dark:text-gray-400/80"
                  )}
                >
                  {link.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}