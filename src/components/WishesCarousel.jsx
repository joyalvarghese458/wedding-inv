import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function WishesCarousel({ wishes = [] }) {
    if (!wishes.length) return null;

    return (
        <div className="mt-5">
            <Swiper
                modules={[Autoplay]}
                spaceBetween={14}
                slidesPerView={1.05}
                loop={wishes.length > 2}
                autoplay={{ delay: 2200, disableOnInteraction: false }}
                breakpoints={{
                    640: { slidesPerView: 1.3 },
                    768: { slidesPerView: 2 },
                }}
            >
                {wishes.map((w) => (
                    <SwiperSlide key={w.id}>
                        <div style={{ backgroundColor: '#f8e8de' }} className="h-full rounded-2xl bg-white p-5 shadow-sm border border-black/5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-full overflow-hidden bg-black/5 flex items-center justify-center shrink-0">
                                        {w.photo_url ? (
                                            <img
                                                src={w.photo_url}
                                                alt={w.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-semibold text-black/40">
                                                {(w.name || "?").slice(0, 1).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="font-semibold leading-tight">{w.name}</div>
                                        <div className="text-xs text-black/50">{w.relation}</div>
                                    </div>
                                </div>

                                <div className="text-xs text-black/40">
                                    {w.created_at ? new Date(w.created_at).toLocaleDateString() : ""}
                                </div>
                            </div>

                            <p className="mt-3 text-sm text-black/70 leading-relaxed">
                                {w.wish}
                            </p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <p className="mt-3 text-xs text-black/40 text-center">Swipe to read more wishes</p>
        </div>
    );
}
