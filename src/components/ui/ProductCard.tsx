"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Landmark } from '@/types';

interface ProductCardProps {
    landmark: Landmark;
}

/**
 * ProductCard - Marketplace item display with WhatsApp integration
 * Used when landmark has marker_config.is_for_sale === true
 */
export function ProductCard({ landmark }: ProductCardProps) {
    const markerConfig = landmark.marker_config as {
        is_for_sale?: boolean;
        price?: number;
        image?: string;
    } | undefined;

    if (!markerConfig?.is_for_sale) {
        return null;
    }

    const price = markerConfig.price || 0;
    const productImage = markerConfig.image || '/images/placeholder-food.jpg';

    // WhatsApp deep link - pre-filled message
    const whatsappMessage = encodeURIComponent(
        `Horas! I would like to order ${landmark.title} from Samosir 360. Can you help me with the details?`
    );
    const whatsappLink = `https://wa.me/?text=${whatsappMessage}`;

    const handleOrder = () => {
        window.open(whatsappLink, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
        >
            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={productImage}
                    alt={landmark.title}
                    fill
                    className="object-cover"
                />
                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/90 text-white backdrop-blur-sm">
                        {landmark.category.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {landmark.title}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2">
                        {landmark.lore_context}
                    </p>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-orange-400" />
                        <span className="text-2xl font-bold text-white">
                            Rp {price.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* WhatsApp Order Button */}
                <motion.button
                    onClick={handleOrder}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-5 h-5" />
                    Order via WhatsApp
                </motion.button>

                {/* Info Text */}
                <p className="text-xs text-white/50 text-center">
                    Traditional Batak delicacy from Samosir Island
                </p>
            </div>
        </motion.div>
    );
}
