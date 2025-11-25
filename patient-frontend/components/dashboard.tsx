import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { UpcomingDates } from "./upcoming-dates";
import { TreatmentsList } from "./treatments-list";
import { ProductRecommendation } from "./product-recommendation";

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.h1
        className="text-2xl font-semibold"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <UpcomingDates />
          <TreatmentsList />
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          <ProductRecommendation />
        </div>
      </div>
    </div>
  );
};