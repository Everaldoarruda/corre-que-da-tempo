"use client";

import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/config";

export function WhatsappFloat() {
  return (
    <motion.a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ delay: 1.5, type: "spring", bounce: 0.5 }}
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-black shadow-lg shadow-black/40"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/50" />
      <MessageCircle className="relative size-7" />
    </motion.a>
  );
}
