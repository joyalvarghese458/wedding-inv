import { useEffect, useMemo, useState } from "react";

export default function WishModal({ open, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [relation, setRelation] = useState("");
    const [wish, setWish] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ loading

    const relationOptions = useMemo(
        () => [
            "Friend",
            "Cousin",
            "Brother",
            "Sister",
            "Relative",
            "Colleague",
            "Neighbor",
            "Other",
        ],
        []
    );

    useEffect(() => {
        if (!open) return;
        setError("");
        setIsSubmitting(false);
    }, [open]);

    useEffect(() => {
        if (!photoFile) {
            setPreviewUrl("");
            return;
        }
        const url = URL.createObjectURL(photoFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [photoFile]);

    if (!open) return null;

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");

        if (!file.type.startsWith("image/")) {
            setPhotoFile(null);
            return setError("Please upload an image file (JPG/PNG).");
        }

        // max 2MB
        if (file.size > 2 * 1024 * 1024) {
            setPhotoFile(null);
            return setError("Image is too large. Please upload below 2MB.");
        }

        setPhotoFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // ✅ block double submit
        setError("");

        const n = name.trim();
        const r = relation.trim();
        const w = wish.trim();

        if (!n) return setError("Please enter your name.");
        if (!r) return setError("Please select your relation.");
        if (!w) return setError("Please write your wish.");
        if (w.length < 5) return setError("Wish is too short. Please write a little more.");
        if (w.length > 300) return setError("Wish is too long. Max 300 characters.");

        try {
            setIsSubmitting(true);

            await onSubmit({
                name: n,
                relation: r,
                wish: w,
                photoFile,
            });

            // clear after submit
            setName("");
            setRelation("");
            setWish("");
            setPhotoFile(null);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h3 className="font-serif text-xl">Send your Wish</h3>
                    <button
                        className="text-black/50 hover:text-black disabled:opacity-40"
                        onClick={onClose}
                        type="button"
                        disabled={isSubmitting}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error ? (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    <div>
                        <label className="text-sm font-medium text-black/70">Name *</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            disabled={isSubmitting}
                            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-[#caa06a]/40 disabled:opacity-60"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-black/70">Relation *</label>
                        <select
                            value={relation}
                            onChange={(e) => setRelation(e.target.value)}
                            disabled={isSubmitting}
                            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-[#caa06a]/40 bg-white disabled:opacity-60"
                        >
                            <option value="">Select relation</option>
                            {relationOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Photo */}
                    <div>
                        <label className="text-sm font-medium text-black/70">Photo (optional)</label>

                        <div className="mt-2 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-black/5 overflow-hidden flex items-center justify-center shrink-0">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xs text-black/40">No photo</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    disabled={isSubmitting}
                                    className="block w-full text-sm text-black/60 disabled:opacity-60
                    file:mr-3 file:rounded-lg file:border-0 file:bg-[#caa06a]/15
                    file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1f1f1f]
                    hover:file:bg-[#caa06a]/25"
                                />
                                <p className="mt-1 text-xs text-black/40">JPG/PNG, max 2MB</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-black/70">Wish *</label>
                        <textarea
                            value={wish}
                            onChange={(e) => setWish(e.target.value)}
                            placeholder="Write your wish…"
                            rows={4}
                            maxLength={300}
                            disabled={isSubmitting}
                            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-[#caa06a]/40 resize-none disabled:opacity-60"
                        />
                        <div className="mt-1 text-xs text-black/40">{wish.trim().length}/300</div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="rounded-xl px-4 py-2 border border-black/10 hover:bg-black/5 disabled:opacity-50"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl px-4 py-2 bg-[#caa06a] text-white font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Sending..." : "Send Wish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
