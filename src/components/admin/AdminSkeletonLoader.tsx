import React from 'react';

export default function AdminSkeletonLoader({ message = 'កំពុងដំណើរការទាញទិន្នន័យ Dashboard...' }: { message?: string }) {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center py-12 px-4 select-none">
      {/* Uiverse.io Skeleton Animation Container */}
      <div className="relative w-[300px] h-[150px] overflow-hidden rounded-2xl bg-dark-900/60 border border-slate-800/80 shadow-2xl flex items-center justify-center">
        {/* Animated Ground */}
        <div className="sk-ground" />

        {/* Crawling/Walking Skeleton */}
        <div className="sk-skeleton">
          {/* Head & Face */}
          <div className="sk-head">
            <div className="sk-eye sk-eye-left" />
            <div className="sk-eye sk-eye-right" />
            <div className="sk-mouth" />
          </div>

          {/* Body */}
          <div className="sk-body" />

          {/* Arms */}
          <div className="sk-arm sk-arm-left" />
          <div className="sk-arm sk-arm-right" />

          {/* Legs */}
          <div className="sk-leg sk-leg-left" />
          <div className="sk-leg sk-leg-right" />
        </div>
      </div>

      {/* Label / Message */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          {message}
        </p>
        <p className="text-xs text-slate-400">សូមរង់ចាំមួយភ្លែត...</p>
      </div>

      <style jsx>{`
        .sk-ground {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          animation: sk-ground-move 2s linear infinite;
        }

        @keyframes sk-ground-move {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .sk-skeleton {
          position: absolute;
          bottom: 12px;
          left: 0;
          width: 100px;
          height: 80px;
          animation: sk-crawl 2.5s linear infinite;
        }

        @keyframes sk-crawl {
          0% {
            transform: translateX(-100px);
          }
          100% {
            transform: translateX(300px);
          }
        }

        .sk-head {
          position: absolute;
          top: 0;
          left: 30px;
          width: 30px;
          height: 30px;
          background-color: #f8fafc;
          border-radius: 50%;
          animation: sk-head-bob 0.5s ease-in-out infinite alternate;
          box-shadow: inset 0 -2px 0 #94a3b8, 0 0 12px rgba(255, 255, 255, 0.2);
        }

        @keyframes sk-head-bob {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-5px);
          }
        }

        .sk-eye {
          position: absolute;
          width: 5px;
          height: 5px;
          background-color: #0f172a;
          border-radius: 50%;
          top: 11px;
        }

        .sk-eye-left {
          left: 8px;
        }

        .sk-eye-right {
          left: 17px;
        }

        .sk-mouth {
          position: absolute;
          width: 12px;
          height: 5px;
          background-color: #0f172a;
          border-radius: 0 0 5px 5px;
          top: 18px;
          left: 9px;
          animation: sk-mouth-talk 0.5s ease-in-out infinite alternate;
        }

        @keyframes sk-mouth-talk {
          0% {
            height: 3px;
          }
          100% {
            height: 6px;
          }
        }

        .sk-body {
          position: absolute;
          top: 30px;
          left: 35px;
          width: 20px;
          height: 35px;
          background-color: #f8fafc;
          border-radius: 10px;
          box-shadow: inset 0 -2px 0 #94a3b8;
        }

        .sk-arm {
          position: absolute;
          width: 10px;
          height: 35px;
          background-color: #f8fafc;
          top: 30px;
          border-radius: 50px;
          box-shadow: inset 0 -2px 0 #94a3b8;
        }

        .sk-arm-left {
          left: 25px;
          transform-origin: top center;
          animation: sk-arm-left 1s ease-in-out infinite;
        }

        .sk-arm-right {
          left: 55px;
          transform-origin: top center;
          animation: sk-arm-right 1s ease-in-out infinite;
        }

        @keyframes sk-arm-left {
          0%,
          100% {
            transform: rotate(30deg);
          }
          50% {
            transform: rotate(-20deg);
          }
        }

        @keyframes sk-arm-right {
          0%,
          100% {
            transform: rotate(-20deg);
          }
          50% {
            transform: rotate(30deg);
          }
        }

        .sk-leg {
          position: absolute;
          width: 10px;
          height: 40px;
          background-color: #f8fafc;
          top: 60px;
          border-radius: 50px;
          box-shadow: inset 0 -2px 0 #94a3b8;
        }

        .sk-leg-left {
          left: 35px;
          transform-origin: top center;
          animation: sk-leg-left 1s ease-in-out infinite;
        }

        .sk-leg-right {
          left: 45px;
          transform-origin: top center;
          animation: sk-leg-right 1s ease-in-out infinite;
        }

        @keyframes sk-leg-left {
          0%,
          100% {
            transform: rotate(10deg);
          }
          50% {
            transform: rotate(-30deg);
          }
        }

        @keyframes sk-leg-right {
          0%,
          100% {
            transform: rotate(-30deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}
