import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { motion } from "framer-motion";

export const ProductRecommendation: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border border-content3 relative overflow-hidden">
        <Button 
          isIconOnly 
          size="sm" 
          variant="light" 
          className="absolute top-2 right-2 z-10 bg-content1/80 backdrop-blur-sm"
        >
          ✕
        </Button>
        <CardBody className="p-4">
          <div className="relative">
            <h2 className="text-lg font-medium mb-1">Lipo(MIC) + B12</h2>
            <p className="text-sm text-foreground-500 mb-4">
              Whether you're aiming to shed pounds or boost energy, Lipotropic (MIC) + B12 injections provide the support you need for optimal vitality.
            </p>
            
            <div className="flex justify-between items-center">
              <Button size="sm" variant="flat" color="primary">
                Learn more
              </Button>
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            
            <div className="absolute -right-4 -bottom-4 w-32 h-32">
              <img 
                src="https://img.heroui.chat/image/medicine?w=200&h=200&u=10" 
                alt="Lipo(MIC) + B12" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};