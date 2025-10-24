import React from "react";
import { motion } from "framer-motion";
import { OfferingsSection } from "./offerings-section";

export const OfferingsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <motion.h1
                className="text-2xl font-semibold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                Offerings
            </motion.h1>

            <OfferingsSection />
        </div>
    );
};


