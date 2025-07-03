import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface DocsyAvatarProps {
  isThinking?: boolean;
  isIdle?: boolean;
  className?: string;
}

export default function DocsyAvatar({ isThinking = false, isIdle = true, className = '' }: DocsyAvatarProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={isIdle ? {
          y: [0, -5, 0],
        } : {}}
        transition={isIdle ? {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        className="relative"
      >
        <Image
          src="/docsy.svg"
          alt="Docsy"
          width={120}
          height={120}
          className="drop-shadow-lg"
        />
      </motion.div>

      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-8 -right-8 bg-white rounded-full p-3 shadow-lg"
          >
            <div className="flex space-x-1">
              <span className="thinking-bubble"></span>
              <span className="thinking-bubble"></span>
              <span className="thinking-bubble"></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle glow effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-blue-400 rounded-full filter blur-3xl -z-10"
        style={{ width: '150%', height: '150%', left: '-25%', top: '-25%' }}
      />
    </div>
  );
}