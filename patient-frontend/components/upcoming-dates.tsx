import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export const UpcomingDates: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border border-content3">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Upcoming dates</h2>
          </div>
          
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-content2 p-4 rounded-full mb-4">
              <Icon icon="lucide:calendar" className="text-2xl text-foreground-500" />
            </div>
            <h3 className="text-lg font-medium mb-1">No upcoming dates</h3>
            <p className="text-foreground-500 text-sm mb-0">There are no upcoming dates at the moment.</p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};