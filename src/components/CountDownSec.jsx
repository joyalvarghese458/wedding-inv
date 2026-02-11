import { useEffect, useState } from "react";

function TimeBox({ value, label }) {
    return (
        <div className="bg-[#fbfaf8] rounded-xl p-5 shadow-inner border border-black/5 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-[#caa06a]">
                {String(value).padStart(2, "0")}
            </div>
            <div className="text-xs uppercase tracking-widest text-black/50 mt-2">
                {label}
            </div>
        </div>
    );
}

export default function CountDown({ targetDate }) {
    // targetDate example: "2026-01-25T10:00:00"
    const weddingDate = new Date(targetDate || "2026-01-25T10:00:00");

    const calculateTimeLeft = () => {
        const diff = weddingDate - new Date();
        if (diff <= 0) return null;

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetDate]);

    if (!timeLeft) {
        return (
            <div className="rounded-2xl bg-white shadow-sm p-8 text-center">
                <h3 className="text-2xl font-serif text-[#caa06a]">
                    🎉 We Are Married! 🎉
                </h3>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white shadow-sm p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <TimeBox value={timeLeft.days} label="Days" />
                <TimeBox value={timeLeft.hours} label="Hours" />
                <TimeBox value={timeLeft.minutes} label="Minutes" />
                <TimeBox value={timeLeft.seconds} label="Seconds" />
            </div>
        </div>
    );
}
