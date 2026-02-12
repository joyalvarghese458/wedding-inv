import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Section from "../components/Section";
import WishModal from "../components/WishModal";
import WishesCarousel from "../components/WishesCarousel";
import { supabase } from "../supabaseClient";
import Countdown from "../components/CountDownSec";
import joyal from "../assets/joyal.png"
import babi from "../assets/babi.png"

function getFileExt(name = "") {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
}

export default function Home() {
    const [isWishesOpen, setIsWishesOpen] = useState(false);

    const [wishes, setWishes] = useState([]);
    const [loadingWishes, setLoadingWishes] = useState(true);
    const [savingWish, setSavingWish] = useState(false);
    const [wishesError, setWishesError] = useState("");
    const [isVideoOpen, setIsVideoOpen] = useState(false);


    const sortedWishes = useMemo(() => {
        return [...wishes].sort((a, b) =>
            (b.created_at || "").localeCompare(a.created_at || "")
        );
    }, [wishes]);

    const fetchWishes = async () => {
        setWishesError("");
        setLoadingWishes(true);

        const { data, error } = await supabase
            .from("wishes")
            .select("id,name,relation,wish,photo_url,created_at")
            .order("created_at", { ascending: false });

        if (error) {
            setWishesError(error.message);
            setLoadingWishes(false);
            return;
        }

        setWishes(data || []);
        setLoadingWishes(false);
    };

    useEffect(() => {
        fetchWishes();
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel("wishes-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "wishes" },
                (payload) => {
                    const newWish = payload.new;

                    // avoid duplicates
                    setWishes((prev) => {
                        if (prev.some((w) => w.id === newWish.id)) return prev;
                        return [newWish, ...prev];
                    });
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "wishes" },
                (payload) => {
                    const deletedId = payload.old?.id;
                    if (!deletedId) return;
                    setWishes((prev) => prev.filter((w) => w.id !== deletedId));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);


    const handleSubmitWish = async ({ name, relation, wish, photoFile }) => {
        if (savingWish) return;
        setSavingWish(true);

        try {
            let photo_url = null;

            // 1) Upload photo (if any)
            if (photoFile) {
                const ext = getFileExt(photoFile.name);
                const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
                const filePath = `public/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("wish-photos")
                    .upload(filePath, photoFile, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: photoFile.type,
                    });

                if (uploadError) throw uploadError;

                const { data: pub } = supabase.storage
                    .from("wish-photos")
                    .getPublicUrl(filePath);

                photo_url = pub?.publicUrl || null;
            }

            // 2) Insert wish row
            const { error: insertError } = await supabase.from("wishes").insert([
                {
                    name,
                    relation,
                    wish,
                    photo_url,
                    created_at: new Date().toISOString(),
                },
            ]);

            if (insertError) throw insertError;

            // 3) Refresh wishes
            await fetchWishes();
        } catch (err) {
            alert(err?.message || "Failed to send wish. Please try again.");
        } finally {
            setSavingWish(false);
        }
    };

    return (
        <div className="bg-[#fbfaf8] text-[#1f1f1f]">
            <Navbar onOpenWishes={() => setIsWishesOpen(true)} />

            {/* HERO */}
            <section id="home" className="relative min-h-[78vh] sm:min-h-[85vh]">
                <div
                    className="absolute inset-0 bg-center bg-cover"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1600&q=80)",
                    }}
                />
                <div className="absolute inset-0 bg-black/35" />

                <div className="relative px-4 pt-20 pb-14 sm:pt-28">
                    <div className="mx-auto max-w-5xl text-center text-white">
                        <p className="text-[11px] tracking-[0.35em] uppercase text-white/80">
                            We are getting married!
                        </p>

                        <h1 className="mt-4 font-serif text-5xl sm:text-6xl md:text-7xl">
                            Ronaldo <span className="text-[#caa06a]">♥</span> Georgina
                        </h1>
                        <div className="mt-7 flex items-center justify-center gap-4 text-white/90">
                            <span className="text-sm">April</span>
                            <span className="text-5xl font-bold">25</span>
                            <span className="text-sm">2026</span>
                        </div>

                        <div className="mt-6 text-sm sm:text-base text-white/85 leading-relaxed">
                            <p>10:00 AM - 12:00 PM, January 25, 2026</p>
                            <p>Church / Venue, City, State</p>
                            <p className="mt-2">Contact: +91 123456789</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Couples */}
            <Section id="couples" title="We’re getting Married!" subtitle="Hello everybody!">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
                        <img
                            className="h-80 w-full object-cover object-top"
                            src="https://m.media-amazon.com/images/I/41iEFRMwcsL._AC_UF894,1000_QL80_.jpg"
                            // src={joyal}
                            alt="Groom"
                        />
                        <div className="p-5">
                            <h3 className="font-serif text-2xl">Ronaldo</h3>
                            <p className="mt-1 text-sm text-black/60">GROOM</p>
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
                        <img
                            className="h-80 w-full object-cover object-top"
                            src="https://awsimages.detik.net.id/community/media/visual/2024/09/04/georgina-rodriguez-5.jpeg?w=600&q=90"
                            // src={babi}
                            alt="Bride"
                        />
                        <div className="p-5">
                            <h3 className="font-serif text-2xl">Georgina</h3>
                            <p className="mt-1 text-sm text-black/60">BRIDE</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section
                id="countdown"
                title="We’re getting married in"
                subtitle="We will become a family in"
            >
                <Countdown targetDate="2026-04-25T10:00:00" />
            </Section>


            {/* Video placeholder */}
            <Section id="video" title="Video" subtitle="Save the date">
                <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                    <div className="relative aspect-video bg-black/10 flex items-center justify-center">

                        {/* Thumbnail Background */}
                        <img
                            src="https://images.ladbible.com/resize?type=webp&quality=70&width=3840&fit=contain&gravity=auto&url=https://images.ladbiblegroup.com/v3/assets/blt8bbf16c2d7a209e5/blt066b8cff2410049a/689b6391766b57cd95775800/Screenshot_2025-08-12_at_16.53.35.png"
                            alt="Wedding Video"
                            className="absolute inset-0 w-full h-full object-cover object-top"
                        />

                        <div className="absolute inset-0 bg-black/40" />

                        <button
                            onClick={() => setIsVideoOpen(true)}
                            className="relative z-10 rounded-full bg-[#caa06a] px-6 py-3 text-white font-semibold hover:opacity-90 shadow-lg"
                        >
                            ▶ Play Video
                        </button>
                    </div>

                    <div className="p-5 text-sm text-black/60 text-center">
                        Watch our special moment 💛
                    </div>
                </div>
            </Section>


            {/* Gallery */}
            {/* <Section id="gallery" title="Captured Moments" subtitle="Couple images">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm">
                            <img
                                className="h-full w-full object-cover"
                                src={`https://picsum.photos/seed/wedding-${i + 1}/600/800`}
                                alt={`Gallery ${i + 1}`}
                            />
                        </div>
                    ))}
                </div>
            </Section> */}

            <Section id="gallery" title="Captured Moments" subtitle="Couple images">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        "https://www.theglobeandmail.com/resizer/v2/77BBTQW3BJBIVNYLZS7XGG227I.jpg?auth=4a93c67f95b169337cd2cf9290d124f4284a455c8991fdeb1ddf3528be111c20&width=600&quality=80",
                        "https://imgengine.khaleejtimes.com/khaleejtimes-english/2025-08-12/4hkyzek0/ron-geo3.jpg?width=600&height=400&format=auto",
                        "https://i.dailymail.co.uk/1s/2025/01/27/16/94565935-14330429-image-a-2_1737995949209.jpg",
                        "https://static.toiimg.com/photo/77703576.cms?imgsize=119023",
                        "https://i.pinimg.com/236x/51/18/6a/51186a476ec78bd9459437c0576dd206.jpg",
                        "https://images.mid-day.com/images/images/2020/feb/7/georgi-ronny-a_l.jpg",
                        "https://hollywoodlife.com/wp-content/uploads/2017/07/cristiano-ronaldo-and-georgina-shutterstock-5.jpg?w=680",
                        "https://www.thesun.co.uk/wp-content/uploads/2019/01/NINTCHDBPICT000464752839.jpg",
                    ].map((img, i) => (
                        <div
                            key={i}
                            className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm"
                        >
                            <img
                                className="h-full w-full object-cover"
                                src={img}
                                alt={`Gallery ${i + 1}`}
                            />
                        </div>
                    ))}
                </div>
            </Section>



            {/* When & Where */}
            <Section id="whenwhere" title="When & Where" subtitle="Event details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        {
                            title: "Ceremony",
                            time: "10:00 AM - 12:00 PM",
                            place: "Church / Venue, City",
                            image:
                                "https://irinjalakudadiocese.com/wp-content/uploads/2020/06/Kuttikadu-cr-1.jpg",
                        },
                        {
                            title: "Reception",
                            time: "12:00 PM - 4:00 PM",
                            place: "Hall / Venue, City",
                            image:
                                "https://www.fbt.ae/assets/images/slider/celebrations/slid-2.jpg",
                        },
                    ].map((card) => (
                        <div
                            key={card.title}
                            className="rounded-2xl overflow-hidden bg-white shadow-sm"
                        >
                            {/* Image */}
                            <div
                                className="h-44 bg-cover bg-center"
                                style={{ backgroundImage: `url(${card.image})` }}
                            />

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="font-serif text-3xl text-[#caa06a]">
                                    {card.title}
                                </h3>
                                <p className="mt-2 text-black/60">{card.place}</p>
                                <p className="mt-3 text-sm text-black/70">{card.time}</p>

                                <button className="mt-5 rounded-full bg-[#caa06a] px-5 py-2 text-sm font-medium text-white hover:opacity-90">
                                    Location
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>


            {/* Wishes */}
            <Section id="wishes" title="Wishes" subtitle="Send your love">
                <div className="mt-10 text-center">
                    <button
                        onClick={() => setIsWishesOpen(true)}
                        className="rounded-full bg-[#caa06a] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                    >
                        Send Wishes
                    </button>
                </div>
                {/* <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-black/60">Messages from friends & family ❤️</p>
                    <button
                        onClick={() => setIsWishesOpen(true)}
                        className="rounded-full bg-[#caa06a] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                        {savingWish ? "Sending..." : "Send Wishes"}
                    </button>
                </div> */}

                {loadingWishes ? (
                    <div className="mt-6 rounded-2xl bg-white p-6 text-center text-black/60 shadow-sm">
                        Loading wishes...
                    </div>
                ) : wishesError ? (
                    <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-6 text-center text-red-700">
                        {wishesError}
                    </div>
                ) : sortedWishes.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-white p-6 text-center text-black/60 shadow-sm">
                        No wishes yet. Be the first one to send a wish!
                    </div>
                ) : (
                    <WishesCarousel wishes={sortedWishes} />
                )}
            </Section>

            {/* Footer */}
            <footer className="px-4 py-10 text-center text-sm text-black/60">
                © {new Date().getFullYear()} Wedding Invitation. All rights reserved.
            </footer>

            {/* Modal */}
            <WishModal
                open={isWishesOpen}
                onClose={() => setIsWishesOpen(false)}
                onSubmit={handleSubmitWish}
            />

            {/* Video Modal */}
            {isVideoOpen && (
                <div
                    className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setIsVideoOpen(false)}
                >
                    <div
                        className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-3 right-3 z-10 bg-white/20 text-white px-3 py-1 rounded-lg hover:bg-white/30"
                        >
                            ✕
                        </button>

                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube-nocookie.com/embed/EfvwM4doq-w?autoplay=1&rel=0"
                            title="Wedding Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />

                    </div>
                </div>
            )}

        </div>
    );
}
