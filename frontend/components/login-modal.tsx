import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Turnstile } from '@marsidev/react-turnstile';
import Image from "next/image";
import Link from "next/link";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
  user?: { username: string; votes?: number } | null;
  onLogout?: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, user, onLogout }) => {
  const [username, setUsername] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<any>(null);

  const handleLogin = async () => {
    setError(null);
    if (!username.trim()) return;

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Security check failed');
      }

      onLogin(username);
      setUsername("");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      onClose();
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal - Wanted Poster Style */}
          <div className="fixed inset-0 z-101 flex items-center justify-center p-4 pb-24 sm:pb-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md mx-auto bg-gradient-to-br from-[#e8d4b8] via-[#d4b896] to-[#b89968] border-4 sm:border-8 border-[#8c502e] rounded-none shadow-[0_0_20px_rgba(0,0,0,0.2)] text-[#3c2a1e] my-auto"
            >
              {/* Decorative Tears - Top */}
              <div className="absolute top-0 left-12 bg-[#8c502e] w-2 h-4 [clip-path:polygon(0%_0%,_100%_0%,_60%_100%)]"></div>
              <div className="absolute top-0 right-12 bg-[#8c502e] w-1 h-3 [clip-path:polygon(0%_0%,_100%_0%,_60%_100%)]"></div>
              <div className="absolute top-0 right-10 bg-[#8c502e] w-1 h-2 [clip-path:polygon(0%_0%,_100%_0%,_60%_100%)]"></div>
              
              {/* Decorative Tears - Bottom */}
              <div className="absolute bottom-0 left-4 bg-[#8c502e] w-1 h-3 [clip-path:polygon(60%_0%,_100%_100%,_0%_100%)]"></div>
              <div className="absolute bottom-0 right-4 bg-[#8c502e] w-2 h-3 [clip-path:polygon(60%_0%,_100%_100%,_0%_100%)]"></div>
              <div className="absolute bottom-0 right-6 bg-[#8c502e] w-1 h-5 [clip-path:polygon(60%_0%,_100%_100%,_0%_100%)]"></div>
              
              {/* Decorative Tears - Left */}
              <div className="absolute left-0 top-16 bg-[#8c502e] w-2 h-1 [clip-path:polygon(100%_60%,0%_0%,_0%_100%)]"></div>
              <div className="absolute left-0 top-20 bg-[#8c502e] w-3 h-1 [clip-path:polygon(100%_60%,0%_0%,_0%_100%)]"></div>
              <div className="absolute left-0 bottom-16 bg-[#8c502e] w-2 h-1 [clip-path:polygon(100%_60%,0%_0%,_0%_100%)]"></div>
              <div className="absolute left-0 bottom-36 bg-[#8c502e] w-3 h-1 [clip-path:polygon(100%_60%,0%_0%,_0%_100%)]"></div>
              
              {/* Decorative Tears - Right */}
              <div className="absolute right-0 top-24 bg-[#8c502e] w-2 h-1 [clip-path:polygon(0%_60%,100%_0%,_100%_100%)]"></div>
              <div className="absolute right-0 top-36 bg-[#8c502e] w-3 h-1 [clip-path:polygon(0%_60%,100%_0%,_100%_100%)]"></div>
              <div className="absolute right-0 bottom-24 bg-[#8c502e] w-2 h-1 [clip-path:polygon(0%_60%,100%_0%,_100%_100%)]"></div>
              <div className="absolute right-0 bottom-28 bg-[#8c502e] w-3 h-1 [clip-path:polygon(0%_60%,100%_0%,_100%_100%)]"></div>

              {/* Close Button */}
              <button
                onClick={onClose}
                type="button"
                className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 z-10"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>

              <div className="relative p-4 sm:p-6">
                {/* WANTED Header */}
                <h2 className="tracking-tight text-center text-4xl sm:text-6xl font-extrabold pt-2 sm:pt-4">
                  {user?.username === 'KiratDewas' ? 'UNWANTED' : 'WANTED'}
                </h2>

                {/* Character Image */}
                <div className="border-2 sm:border-4 border-[#8c502e] bg-[#e8d4b8] flex justify-center items-center">
                  <Image
                    src={user ? `https://render.crafty.gg/3d/bust/${user.username}` : "https://render.crafty.gg/3d/bust/Steve"}
                    alt={user?.username || "Steve"}
                    width={128}
                    height={128}
                    className="w-40 h-40 sm:w-60 sm:h-60 object-cover object-top pt-4 sm:pt-8 px-2 sm:px-4"
                    unoptimized
                  />
                </div>

                {/* Content */}
                <div className="mt-4">
                  {!user ? (
                    // Login Form
                    <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                      <label htmlFor="username" className="font-semibold text-base sm:text-lg mb-2">
                        Your Minecraft username
                      </label>
                      <input
                        id="username"
                        type="text"
                        placeholder="e.g. KiratDewas, Notch, Steve"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex h-9 w-full rounded-md border-2 border-[#8c502e] bg-transparent px-3 py-1 text-sm sm:text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8c502e] mb-4"
                      />
                      
                      <div className="flex justify-center mb-4">
                        <Turnstile
                          ref={turnstileRef}
                          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                          onSuccess={setTurnstileToken}
                          onError={() => setError('Security check failed. Please try again.')}
                          onExpire={() => setTurnstileToken(null)}
                        />
                      </div>

                      {error && (
                        <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={!username.trim() || !turnstileToken || loading}
                        className="rounded-md bg-[#b8860b] border-b-2 sm:border-b-4 border-[#632811] text-white uppercase hover:scale-95 transition-transform duration-200 cursor-pointer shadow-[0_6px_4px_1px_rgba(0,0,0,0.35)] px-4 sm:px-6 py-2 text-sm sm:text-base w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {loading ? 'Verifying...' : 'Sign in'}
                      </button>
                    </form>
                  ) : (
                    // User Profile View
                    <div className="flex flex-col items-center">
                      <div className="flex space-x-2 sm:space-x-4 items-center mb-2">
                        <div className="w-6 sm:w-12 h-0.5 bg-[#8c502e]"></div>
                        <div className="text-center text-sm sm:text-2xl font-bold">
                          {user.username === 'KiratDewas' ? 'I DON\'T CARE' : 'DEAD OR ALIVE'}
                        </div>
                        <div className="w-6 sm:w-12 h-0.5 bg-[#8c502e]"></div>
                      </div>
                      <div className="text-center font-semibold text-4xl sm:text-6xl mb-2">{user.username}</div>
                      <div className="text-center text-2xl sm:text-4xl mb-4">
                        {user.username === 'KiratDewas' ? 'Rs. 0' : 'Rs. 100'}
                      </div>
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 font-semibold">
                        <button
                          onClick={() => {
                            onLogout?.();
                            onClose();
                          }}
                          className="rounded-md bg-red-800 border-b-2 sm:border-b-4 border-red-900 text-white uppercase hover:scale-95 transition-transform duration-200 cursor-pointer shadow-[0_6px_4px_1px_rgba(0,0,0,0.35)] font-bold text-sm sm:text-base p-2 px-3 sm:p-3 sm:px-4 w-full sm:w-auto"
                        >
                          Sign out
                        </button>
                        <Link
                          href={`/profile/${user.username}`}
                          onClick={onClose}
                          className="rounded-md bg-[#b8860b] border-b-2 sm:border-b-4 border-[#632811] text-white uppercase hover:scale-95 transition-transform duration-200 cursor-pointer shadow-[0_6px_4px_1px_rgba(0,0,0,0.35)] font-bold px-3 py-2 sm:px-4 sm:py-3 inline-block text-sm sm:text-base w-full sm:w-auto text-center"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;