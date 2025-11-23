"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTypewriter } from "@/hooks/useTypewriter";
import { getProductsByCategory, Product } from "@/lib/mockProducts";
import { ProductDetailModal } from "./ProductDetailModal";
import Image from "next/image";

type Emotion = "happy" | "mysterious" | "serious";

export function NPCModal() {
    const { isNPCModalOpen, setNPCModalOpen, currentLandmark, activeFilters } = useAppStore();
    const [story, setStory] = useState("");
    const [emotion, setEmotion] = useState<Emotion>("happy");
    const [isLoading, setIsLoading] = useState(false);

    // Product modal state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // Typewriter effect for AI messages
    const { displayedText: displayedStory } = useTypewriter({
        text: story,
        speed: 40,
        enabled: !isLoading,
    });

    // Get relevant products based on category
    const relevantProducts =
        currentLandmark?.category === "food" || currentLandmark?.category === "music"
            ? getProductsByCategory(currentLandmark.category)
            : [];

    const fetchStory = async () => {
        if (!currentLandmark) return;

        setIsLoading(true);

        try {
            const response = await fetch("/api/chat/story", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    activeFilters,
                    loreContext: currentLandmark.lore_context,
                    landmarkTitle: currentLandmark.title,
                }),
            });

            const data = await response.json();

            if (data.message) {
                setStory(data.message);
                setEmotion(data.emotion || "happy");
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            console.error("Failed to fetch story:", error);
            setStory("Horas! The spirits are quiet today. Please try again later.");
            setEmotion("serious");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch story from AI when modal opens
    useEffect(() => {
        if (isNPCModalOpen && currentLandmark) {
            fetchStory();
        }
        // Reset when modal closes
        if (!isNPCModalOpen) {
            setStory("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNPCModalOpen, currentLandmark]);


    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const emotionColors = {
        happy: "from-yellow-500/20 to-orange-500/20",
        mysterious: "from-purple-500/20 to-indigo-500/20",
        serious: "from-gray-500/20 to-slate-500/20",
    };

    const emotionBorders = {
        happy: "border-yellow-500/30",
        mysterious: "border-purple-500/30",
        serious: "border-gray-500/30",
    };

    return (
        <AnimatePresence>
            {isNPCModalOpen && (
                <>
                    {/* Right Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-screen w-full max-w-md z-50 bg-black border-l border-white/10 shadow-2xl overflow-y-auto"
                    >
                        {/* Glass morphism overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-black/95 backdrop-blur-xl" />

                        {/* Content */}
                        <div className="relative p-6 flex flex-col h-full">
                            {/* Close button */}
                            <button
                                onClick={() => setNPCModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                                aria-label="Close sidebar"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6 pt-2">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-3xl shadow-lg ring-2 ring-amber-500/50">
                                    👴🏽
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Opung</h2>
                                    <p className="text-white/70 text-sm">Village Elder</p>
                                </div>
                            </div>

                            {/* Landmark Title */}
                            {currentLandmark && (
                                <div className={`mb-4 pb-4 border-b border-gradient-to-r ${emotionBorders[emotion]}`}>
                                    <h3 className="text-xl font-semibold text-white">
                                        {currentLandmark.title}
                                    </h3>
                                    <p className="text-white/50 text-sm mt-1 capitalize">
                                        {currentLandmark.category}
                                    </p>
                                </div>
                            )}

                            {/* Landmark Image (if available) */}
                            {currentLandmark?.image_asset && (
                                <div className="mb-6 rounded-xl overflow-hidden border border-white/20 shadow-lg relative h-64 w-full">
                                    <Image
                                        src={currentLandmark.image_asset}
                                        alt={currentLandmark.title}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            // Hide image if it fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Story Content */}
                            <div className={`bg-gradient-to-br ${emotionColors[emotion]} backdrop-blur-sm rounded-xl p-6 min-h-[120px] border ${emotionBorders[emotion]} flex-1`}>
                                {isLoading ? (
                                    <div className="flex items-center gap-2 text-white/70">
                                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        <span className="ml-2">Opung is gathering his thoughts...</span>
                                    </div>
                                ) : (
                                    <p className="text-white text-lg leading-relaxed">
                                        {displayedStory}
                                        {displayedStory !== story && (
                                            <span className="inline-block w-1 h-5 bg-white/70 ml-1 animate-pulse" />
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* Marketplace Section - Only show for food/music */}
                            {relevantProducts.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShoppingBag className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-lg font-semibold text-white">
                                            {currentLandmark?.category === "food"
                                                ? "Kuliner Khas Samosir"
                                                : "Seni & Budaya"}
                                        </h3>
                                    </div>

                                    {/* Scrollable Product Cards */}
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {relevantProducts.map((product) => (
                                            <motion.button
                                                key={product.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleProductClick(product)}
                                                className="w-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:border-purple-400/50 transition-all duration-200 text-left"
                                            >
                                                <div className="flex gap-3">
                                                    {/* Product Icon */}
                                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                                                        {product.category === "food" ? "🍽️" : "🎵"}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-semibold text-sm truncate mb-1">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-orange-400 font-bold text-sm mb-1">
                                                            Rp {product.price.toLocaleString("id-ID")}
                                                        </p>
                                                        <p className="text-white/60 text-xs line-clamp-2">
                                                            {product.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer info */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-white/50 text-xs text-center">
                                    Powered by AI • Cultural heritage of Samosir Island
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Product Detail Modal */}
                    <ProductDetailModal
                        product={selectedProduct}
                        isOpen={isProductModalOpen}
                        onClose={() => setIsProductModalOpen(false)}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
