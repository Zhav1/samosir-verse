'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, MessageCircle } from 'lucide-react';
import { Product } from '@/lib/mockProducts';
import { generateProductInquiry, openWhatsApp } from '@/lib/whatsapp';

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductDetailModal({
    product,
    isOpen,
    onClose,
}: ProductDetailModalProps) {
    if (!product) return null;

    const handleWhatsAppClick = () => {
        const message = generateProductInquiry(product.name, product.price);
        openWhatsApp(product.whatsappNumber, message);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        {/* Product Image */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-orange-900/20 flex items-center justify-center overflow-hidden">
                            {/* Placeholder gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10" />
                            <div className="relative text-6xl">
                                {product.category === 'food' ? '🍽️' : '🎵'}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Title & Rating */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {product.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-white font-medium">
                                            {product.rating}
                                        </span>
                                    </div>
                                    <span className="text-gray-400 text-sm">
                                        ({product.reviewCount} ulasan)
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-orange-400">
                                    Rp {product.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    {product.category === 'music' ? '/ paket' : '/ porsi'}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {product.description}
                            </p>

                            {/* Address */}
                            <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Lokasi:</p>
                                    <p className="text-sm text-white">{product.address}</p>
                                </div>
                            </div>

                            {/* WhatsApp Button */}
                            <button
                                onClick={handleWhatsAppClick}
                                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>Pesan via WhatsApp</span>
                            </button>

                            {/* Info Text */}
                            <p className="text-xs text-gray-500 text-center">
                                Anda akan diarahkan ke WhatsApp untuk melakukan pemesanan
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
