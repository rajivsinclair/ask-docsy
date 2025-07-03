import { motion } from 'framer-motion'

interface DocsyAvatarProps {
  isThinking: boolean
}

export function DocsyAvatar({ isThinking }: DocsyAvatarProps) {
  return (
    <div className="relative">
      {/* Main Avatar */}
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl"
        animate={isThinking ? 'thinking' : 'idle'}
        variants={{
          idle: {
            scale: 1,
            rotate: 0,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          },
          thinking: {
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
            boxShadow: [
              '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              '0 25px 50px -12px rgba(168, 85, 247, 0.4)',
              '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            ],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        }}
      >
        {/* Docsy Face */}
        <motion.div
          className="text-white text-3xl font-bold select-none"
          animate={isThinking ? 'thinking' : 'idle'}
          variants={{
            idle: {
              scale: 1
            },
            thinking: {
              scale: [1, 1.1, 1],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          }}
        >
          D
        </motion.div>
      </motion.div>

      {/* Thinking Bubbles */}
      {isThinking && (
        <div className="absolute -top-2 -right-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-purple-400 rounded-full"
              style={{
                right: i * 4,
                top: i * -6
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Pulse Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-purple-300"
        animate={isThinking ? 'active' : 'inactive'}
        variants={{
          inactive: {
            scale: 1,
            opacity: 0
          },
          active: {
            scale: [1, 1.5, 1],
            opacity: [0, 0.3, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        }}
      />

      {/* Status Indicator */}
      <motion.div
        className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white shadow-lg"
        animate={isThinking ? 'thinking' : 'ready'}
        variants={{
          ready: {
            backgroundColor: '#10B981', // green
            scale: 1
          },
          thinking: {
            backgroundColor: '#F59E0B', // amber
            scale: [1, 1.2, 1],
            transition: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        }}
      />

      {/* Sparkles when thinking */}
      {isThinking && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}