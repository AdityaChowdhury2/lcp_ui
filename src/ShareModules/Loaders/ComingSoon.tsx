// ComingSoon.jsx
import { IMAGE_BASE } from "@/constants/constants";
import { useEffect, useState } from "react";

export default function ComingSoon() {
  const launchDate = new Date("2026-06-01T10:00:00");

  const [timeLeft, setTimeLeft] = useState({
    d: 0,
    h: 0,
    m: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = launchDate - now;

      if (diff <= 0) return;

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-brand-cream/40">

      <div className="w-full max-w-xl bg-white border border-brand-sand rounded-2xl shadow-lg p-10 text-center">

        {/* 🔰 BIG LOGO */}
        <div className="flex justify-center mb-6">
          <img
            src={`${IMAGE_BASE}emblemofindia.png`} // 🔁 replace path
            alt="Department Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-brand-dark mb-2">
          Coming Soon
        </h1>

        <p className="text-brand-deep mb-6 text-sm">
          This service is currently under preparation and will be available shortly.
        </p>

        {/* Launch Date */}
        <div className="bg-brand-cream border border-brand-sand rounded-lg p-4 mb-6">
          <p className="text-sm text-brand-deep">Expected Launch Date</p>
          <p className="text-lg font-semibold text-brand-dark">
            1 June 2026, 10:00 AM
          </p>
        </div>

        {/* Countdown */}
        <div className="flex justify-center gap-3 mb-6">
          {[
            { label: "Days", value: timeLeft.d },
            { label: "Hours", value: timeLeft.h },
            { label: "Minutes", value: timeLeft.m },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-brand-olive/60 border border-brand-sand rounded-md px-3 py-2 min-w-[70px]"
            >
              <div className="text-lg font-bold text-brand-deep">
                {item.value}
              </div>
              <div className="text-xs text-brand-deep">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-20 h-[2px] bg-brand-sand mx-auto mb-4"></div>

        {/* Footer */}
        <p className="text-xs text-gray-500">
          Please check back later or contact the administrator.
        </p>

      </div>
    </div>
  );
}