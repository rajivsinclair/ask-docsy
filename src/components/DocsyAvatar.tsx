import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface DocsyAvatarProps {
  isThinking: boolean
}

export function DocsyAvatar({ isThinking }: DocsyAvatarProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (isThinking) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 120 + 10,
        y: Math.random() * 120 + 10,
        delay: Math.random() * 2
      }))
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [isThinking])

  return (
    <div className="relative w-32 h-32">
      {/* Main Avatar Container */}
      <motion.div
        className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
        animate={isThinking ? 'thinking' : 'idle'}
        variants={{
          idle: {
            scale: 1,
            rotate: 0,
          },
          thinking: {
            scale: [1, 1.02, 1],
            rotate: [0, 1, -1, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        }}
      >
        {/* Docsy SVG */}
        <div className="w-20 h-20 flex items-center justify-center">
          <svg 
            width="80" 
            height="60" 
            viewBox="0 0 512 377" 
            className="fill-black"
          >
            <g>
              <path d="M247.5,51.8L205.7,2.6c0,0-34-13.9-44.9,22.4c-10.9,36.4-34,87.3-63.1,96.4c-0.6,6.1,6.1,8.5,6.1,8.5s7.1,3.3,20.9,3c18.2-4.6,37.3-19.1,37.5-19.3c0.3-0.2,0.8-0.2,1,0.1c0.2,0.3,0.2,0.8-0.1,1c-0.2,0.1-15.8,11.9-32.3,17.7c20.4-1.8,52.2-11.3,94.9-43.3C225.7,89.4,248.7,74.2,247.5,51.8z"/>
              <path d="M313,275.1c-0.2,0-0.2-0.4,0-0.4c2.8,0,5.6-0.1,8.4-0.2c-0.6-0.4-1.2-0.7-1.8-1.1c-0.2-0.1,0-0.4,0.2-0.3c0.7,0.5,1.5,0.9,2.2,1.4c1.7-0.1,3.4-0.1,5.1-0.1c4.6,0,9.3,0.3,13.7,2c0.2,0.1,0.2,0.3,0,0.4c-0.5,0.1-0.9,0.3-1.3,0.4c3-0.2,5.9-0.4,8.9-0.6c6.9-0.4,13.7-0.6,20.6,0.2c5,0.6,9.8,1.9,14.2,4.4c1.2,0.7,2.4,1.5,3.6,2.3c3.4-2.4,5.9-5.1,7-8.2c2.7-7.4-4.8-9.7-4.8-9.7s16.8-71.3-45.1-77.3c-39.9-3.9-107.4-64.5-102-113.9l-58-2.7c0,0-53.7,102.6,19.3,179.9c0,0,9.7,14,3.2,34.4c-7.5,7.5-21.5,18.3-1.1,20.4c20.4,2.1,30.1-19.3,30.1-19.3l-9.3-45.5c0,0,21.1,27.2,56.6,31.5c21.7,2.6,34.1,2.8,40.4,2.5c-0.3-0.2-0.6-0.4-1-0.6C319,275,316,275.1,313,275.1z"/>
              <path d="M188.7,21.5L208,3.8c0,0,57.8,13.6,56.8,76.4C263.7,143,188.7,21.5,188.7,21.5z"/>
            </g>
          </svg>
        </div>
      </motion.div>

      {/* Thinking Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3 bg-yellow-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-15, -35, -15],
            opacity: [0, 1, 0],
            scale: [0.3, 1, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Brutalist Shadow Effect */}
      {isThinking && (
        <motion.div
          className="absolute inset-0 bg-yellow-300 border-4 border-black opacity-40 -z-10"
          style={{
            transform: 'translate(10px, 10px)'
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  )
}