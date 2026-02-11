import { useEffect, useState } from "react";

const links = [
    { id: "home", label: "Home" },
    { id: "couples", label: "Couples" },
    { id: "video", label: "Video" },
    { id: "gallery", label: "Gallery" },
    { id: "whenwhere", label: "When & Where" },
];

export default function Navbar({ onOpenWishes }) {
    const [open, setOpen] = useState(false);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setOpen(false);
    };

    // Close menu on resize to desktop
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-black/5">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
                {/* Brand */}
                <button
                    onClick={() => scrollTo("home")}
                    className="text-left leading-tight"
                >
                    <div className="font-serif text-lg text-[#1f1f1f]">Your Names</div>
                    <div className="text-[11px] tracking-[0.25em] uppercase text-black/50">
                        Wedding Invitation
                    </div>
                </button>

                {/* Desktop links */}
                <nav className="hidden md:flex items-center gap-7 text-sm text-black/70">
                    {links.map((l) => (
                        <button
                            key={l.id}
                            onClick={() => scrollTo(l.id)}
                            className="hover:text-black transition"
                        >
                            {l.label}
                        </button>
                    ))}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenWishes}
                        className="rounded-full border border-[#caa06a] px-3 sm:px-4 py-2 text-sm font-medium text-[#1f1f1f] hover:bg-[#caa06a]/10 transition flex items-center gap-2"
                    >
                        <span className="text-[#caa06a]">✉</span>
                        <span className="hidden sm:inline">Send Wishes</span>
                        <span className="sm:hidden">Wishes</span>
                    </button>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden rounded-xl border border-black/10 p-2 hover:bg-black/5 transition"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {open ? (
                            <span className="text-xl leading-none">✕</span>
                        ) : (
                            <span className="text-xl leading-none">☰</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {open ? (
                <div className="md:hidden border-t border-black/5 bg-white">
                    <div className="mx-auto max-w-5xl px-4 py-3">
                        <div className="grid gap-2">
                            {links.map((l) => (
                                <button
                                    key={l.id}
                                    onClick={() => scrollTo(l.id)}
                                    className="w-full text-left rounded-xl px-4 py-3 bg-black/5 hover:bg-black/10 transition text-sm font-medium text-[#1f1f1f]"
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setOpen(false);
                                onOpenWishes();
                            }}
                            className="mt-3 w-full rounded-xl bg-[#caa06a] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Send Wishes
                        </button>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
