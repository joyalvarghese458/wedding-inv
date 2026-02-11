export default function Section({ id, title, subtitle, children, className = "" }) {
    return (
        <section id={id} className={`px-4 py-14 sm:py-16 ${className}`}>
            <div className="mx-auto w-full max-w-5xl">
                {title ? (
                    <div className="text-center">
                        {subtitle ? (
                            <p className="text-[11px] tracking-[0.35em] text-[#b88c5a] uppercase">
                                {subtitle}
                            </p>
                        ) : null}
                        <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[#1f1f1f]">
                            {title}
                        </h2>
                    </div>
                ) : null}

                <div className={`${title ? "mt-10" : ""}`}>{children}</div>
            </div>
        </section>
    );
}
