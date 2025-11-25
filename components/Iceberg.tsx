import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface IcebergProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
}

export function Iceberg({ points, size = 'md' }: IcebergProps) {
  const maxPoints = 3000;
  const percentage = Math.min((points / maxPoints) * 100, 100);
  
  // Айсберг поднимается снизу вверх (или вода поднимается, сохраняя текущую логику)
  // Существующая логика: 0% -> waterLevel=100 (y=200, вода низко). 100% -> waterLevel=0 (y=20, вода высоко)
  // Проверим, не инвертировано ли это. Обычно прогресс = заполнение.
  // Если это "Айсберг знаний", то возможно мы хотим чтобы он всплывал (вода опускалась)?
  // Но код есть код. Я сохраню логику, но добавлю анимации.
  
  const waterLevel = 100 - percentage;
  const currentWaterY = 20 + (waterLevel / 100) * 180;
  
  const sizes = {
    sm: { width: 80, height: 100 },
    md: { width: 120, height: 150 },
    lg: { width: 200, height: 250 }
  };
  
  const { width, height } = sizes[size];

  // Birds animation state
  const [birds, setBirds] = useState<number[]>([1, 2, 3]);

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        viewBox="0 0 200 250"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="iceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Birds - Летающие птицы */}
        {birds.map((bird, i) => (
          <motion.g
            key={bird}
            initial={{ x: -50, y: 20 + i * 15, opacity: 0 }}
            animate={{ 
              x: 250, 
              y: [20 + i * 15, 10 + i * 15, 25 + i * 15],
              opacity: [0, 1, 1, 0] 
            }}
            transition={{ 
              duration: 10 + i * 2, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 5,
              times: [0, 0.1, 0.9, 1]
            }}
          >
            <path
              d="M0 0 L5 3 L10 0"
              stroke="#0284c7"
              strokeWidth="1.5"
              fill="none"
              transform="scale(0.8)"
            />
          </motion.g>
        ))}

        {/* Айсберг - Тряска из стороны в сторону */}
        <motion.g
          animate={{ 
            rotate: [-1, 1, -1],
            y: [0, 2, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ originX: "50%", originY: "80%" }} // Rotate around bottom-ish center
        >
          <path
            d="M 100 20 L 140 100 L 130 150 L 120 200 L 80 200 L 70 150 L 60 100 Z"
            fill="url(#iceGradient)"
            stroke="#7dd3fc"
            strokeWidth="2"
          />
          {/* Детали на айсберге для объема */}
          <path
            d="M 100 20 L 100 200"
            stroke="#bae6fd"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
           <path
            d="M 60 100 L 140 100"
            stroke="#bae6fd"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
        </motion.g>
        
        {/* Вода - Фон */}
        <rect
          x="0"
          y={currentWaterY}
          width="200"
          height={250} 
          fill="url(#waterGradient)"
        />

        {/* Волны - Анимация */}
        {/* Волна 1 - Передний план */}
        <motion.path
          d={`M -50 ${currentWaterY} 
             Q 0 ${currentWaterY - 5}, 50 ${currentWaterY} 
             T 150 ${currentWaterY} 
             T 250 ${currentWaterY}
             V 250 H -50 Z`}
          fill="url(#waterGradient)"
          fillOpacity="0.4"
          animate={{ 
            x: [-20, 0, -20],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Волна 2 - Линия */}
        <motion.path
           d={`M -50 ${currentWaterY} 
             Q 0 ${currentWaterY - 5}, 50 ${currentWaterY} 
             T 150 ${currentWaterY} 
             T 250 ${currentWaterY}`}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeOpacity="0.6"
          animate={{ 
            x: [-30, 0, -30],
            y: [0, 2, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />

        {/* Волна 3 - Дополнительная линия для эффекта */}
        <motion.path
           d={`M -50 ${currentWaterY + 5} 
             Q 0 ${currentWaterY}, 50 ${currentWaterY + 5} 
             T 150 ${currentWaterY + 5} 
             T 250 ${currentWaterY + 5}`}
          fill="none"
          stroke="#bae6fd"
          strokeWidth="1"
          strokeOpacity="0.4"
          animate={{ 
            x: [0, -30, 0],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </svg>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center text-xs bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-t-lg shadow-sm">
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
}