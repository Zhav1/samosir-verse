"use client";

import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Send } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTypewriter } from "@/hooks/useTypewriter";
import { getProductsByCategory, Product } from "@/lib/mockProducts";
import { ProductDetailModal } from "./ProductDetailModal";
import Image from "next/image";
import { toSuratBatak } from "@/lib/surat-batak";
import { LocalizedText } from "./LocalizedText";
import { useTranslation } from "@/hooks/useTranslation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Opung3D from "../canvas/Opung3D";

type Emotion = "happy" | "mysterious" | "serious";

export function NPCModal() {
    const { isNPCModalOpen, setNPCModalOpen, currentLandmark, activeFilters, incrementOpungChat } = useAppStore();
    // Chat state
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [currentResponse, setCurrentResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");
    const [emotion, setEmotion] = useState<Emotion>("happy");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const { t } = useTranslation();

    // Typewriter effect for current response
    const { displayedText } = useTypewriter({
        text: currentResponse,
        speed: 30,
        enabled: !isLoading && !!currentResponse,
    });

    // Get relevant products based on category
    const relevantProducts =
        currentLandmark?.category === "food" || currentLandmark?.category === "music"
            ? getProductsByCategory(currentLandmark.category)
            : [];

    const fetchStory = async () => {
        if (!currentLandmark) return;

        setIsLoading(true);
        setMessages([]); // Reset messages on new landmark
        setCurrentResponse("");

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
                    category: currentLandmark.category,
                    language: useAppStore.getState().language,
                }),
            });

            const data = await response.json();

            if (data.message) {
                setCurrentResponse(data.message);
                setEmotion(data.emotion || "happy");
                // Add initial story to messages
                setMessages([{ role: "assistant", content: data.message }]);
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            console.error("Failed to fetch story:", error);
            const errorMsg = "Horas! The spirits are quiet today. Please try again later.";
            setCurrentResponse(errorMsg);
            setMessages([{ role: "assistant", content: errorMsg }]);
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
            setMessages([]);
            setCurrentResponse("");
            setInput("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNPCModalOpen, currentLandmark]);


    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        // Add user message to UI immediately
        const newMessages = [...messages, { role: "user" as const, content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        // Track chat interaction for achievement
        incrementOpungChat();

        try {
            const response = await fetch("/api/chat/story", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    activeFilters,
                    loreContext: currentLandmark?.lore_context,
                    landmarkTitle: currentLandmark?.title,
                    category: currentLandmark?.category,
                    language: useAppStore.getState().language,
                    messages: newMessages, // Send full history
                }),
            });

            const data = await response.json();

            if (data.message) {
                setCurrentResponse(data.message);
                setEmotion(data.emotion || "happy");
                setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
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
                        <div className="relative p-6 flex flex-col min-h-full">
                            {/* Close button */}
                            <button
                                onClick={() => setNPCModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 transition-colors z-50"
                                aria-label="Close sidebar"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            {/* 3D Model Section */}
                            <div className="relative w-full h-[45vh] bg-gradient-to-b from-indigo-900/30 to-black/50 rounded-xl overflow-hidden border border-white/10 mb-6 shadow-2xl">
                                <div className="absolute inset-0 bg-[url('/patterns/batak-pattern.png')] opacity-10 mix-blend-overlay" />

                                <Canvas
                                    camera={{ position: [0, 1, 5], fov: 50 }}
                                    gl={{
                                        alpha: true,
                                        antialias: true,
                                        powerPreference: "high-performance",
                                        preserveDrawingBuffer: true
                                    }}
                                    frameloop="demand"
                                    dpr={[1, 2]}
                                >
                                    {/* Main ambient light */}
                                    <ambientLight intensity={1.2} />

                                    {/* Key light - main illumination from front-top */}
                                    <directionalLight
                                        position={[5, 8, 5]}
                                        intensity={1.5}
                                        castShadow
                                    />

                                    {/* Fill light - soften shadows from the side */}
                                    <pointLight
                                        position={[-5, 3, 5]}
                                        intensity={0.8}
                                        color="#fff5e1"
                                    />

                                    {/* Rim light - create depth from behind */}
                                    <spotLight
                                        position={[0, 5, -8]}
                                        intensity={0.6}
                                        angle={0.5}
                                        penumbra={0.5}
                                    />

                                    <Suspense fallback={null}>
                                        <Opung3D />
                                    </Suspense>

                                    <OrbitControls
                                        enableZoom={false}
                                        enablePan={false}
                                        minPolarAngle={Math.PI / 2.5}
                                        maxPolarAngle={Math.PI / 1.8}
                                        autoRotate={false}
                                    />
                                </Canvas>

                                {/* Name Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                    <h2 className="text-3xl font-bold text-white mb-1">
                                        <LocalizedText text={t('npc.opung')} />
                                    </h2>
                                    <p className="text-amber-400 text-sm font-medium">
                                        <LocalizedText text={t('npc.role')} />
                                    </p>
                                </div>
                            </div>

                            {/* Landmark Title */}
                            {currentLandmark && (
                                <div className={`mb-4 pb-4 border-b border-gradient-to-r ${emotionBorders[emotion]}`}>
                                    {/* Surat Batak Title (only if language is 'bt') */}
                                    {useAppStore.getState().language === 'bt' && (
                                        <h3 className="text-2xl font-surat-batak text-amber-400 mb-1">
                                            {toSuratBatak(currentLandmark.title)}
                                        </h3>
                                    )}

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

                            {/* Chat History */}
                            <div className="flex-1 space-y-4 mb-4">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`
                                                max-w-[85%] rounded-xl p-4 
                                                ${msg.role === 'user'
                                                    ? 'bg-white/10 text-white border border-white/10'
                                                    : `bg-gradient-to-br ${emotionColors[emotion]} border ${emotionBorders[emotion]} text-white`
                                                }
                                            `}
                                        >
                                            {msg.role === 'assistant' && idx === messages.length - 1 && isLoading ? (
                                                <div className="flex items-center gap-2 text-white/70">
                                                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            ) : (
                                                <p className="text-sm leading-relaxed">
                                                    {msg.role === 'assistant' && idx === messages.length - 1
                                                        ? displayedText
                                                        : msg.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                    <div className="flex justify-start">
                                        <div className={`max-w-[85%] rounded-xl p-4 bg-gradient-to-br ${emotionColors[emotion]} border ${emotionBorders[emotion]}`}>
                                            <div className="flex items-center gap-2 text-white/70">
                                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="mt-auto pt-4 border-t border-white/10">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={t('npc.chatPlaceholder')}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="text-[10px] text-white/30">
                                        {isLoading ? <LocalizedText text={t('npc.listening')} /> : <LocalizedText text={t('npc.poweredBy')} />}
                                    </div>
                                    {/* Quiz Trigger Button */}
                                    <button
                                        onClick={() => {
                                            setNPCModalOpen(false);
                                            useAppStore.getState().setQuizModalOpen(true);
                                        }}
                                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                                    >
                                        🧠 {t('quiz.title') || 'Take Quiz'}
                                    </button>
                                </div>
                            </div>

                            {/* Marketplace Section - Only show for food/music */}
                            {relevantProducts.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShoppingBag className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-lg font-semibold text-white">
                                            {currentLandmark?.category === "food"
                                                ? <LocalizedText text={t('filters.food')} />
                                                : <LocalizedText text={t('filters.music')} />}
                                        </h3>
                                    </div>

                                    {/* Scrollable Product Cards */}
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {relevantProducts.map((product) => {
                                            // Helper to get localized string
                                            const getLocalized = (obj: { en: string; id: string; bt: string } | string) => {
                                                if (typeof obj === 'string') return obj;
                                                return obj[useAppStore.getState().language] || obj.en;
                                            };

                                            return (
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
                                                                {getLocalized(product.name)}
                                                            </h4>
                                                            <p className="text-orange-400 font-bold text-sm mb-1">
                                                                Rp {product.price.toLocaleString("id-ID")}
                                                            </p>
                                                            <p className="text-white/60 text-xs line-clamp-2">
                                                                {getLocalized(product.description)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Footer info */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-white/50 text-xs text-center">
                                    <LocalizedText text={t('npc.poweredBy')} />
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
