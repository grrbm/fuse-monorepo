import React from "react";
import { Card, CardBody, Button, Skeleton } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { apiCall } from "../lib/api";

interface TenantProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  productId?: string;
}

export const ProductUpsells: React.FC = () => {
  const [products, setProducts] = React.useState<TenantProduct[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dismissedProducts, setDismissedProducts] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadProducts();
    loadDismissedProducts();
  }, []);

  const loadDismissedProducts = () => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('dismissedProducts');
      if (dismissed) {
        try {
          setDismissedProducts(JSON.parse(dismissed));
        } catch (e) {
          console.error('Error loading dismissed products:', e);
        }
      }
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const result = await apiCall<{ data: TenantProduct[] }>('/tenant-products');
      
      if (result.success && result.data) {
        const productsList = result.data.data || result.data;
        setProducts(Array.isArray(productsList) ? productsList : []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = (productId: string) => {
    const newDismissed = [...dismissedProducts, productId];
    setDismissedProducts(newDismissed);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissedProducts', JSON.stringify(newDismissed));
    }

    // Move to next product
    if (currentIndex < visibleProducts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < visibleProducts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(visibleProducts.length - 1); // Loop to end
    }
  };

  // Filter out dismissed products
  const visibleProducts = products.filter(
    product => !dismissedProducts.includes(product.id)
  );

  const currentProduct = visibleProducts[currentIndex];

  if (isLoading) {
    return (
      <Card className="border border-content3 relative overflow-hidden">
        <CardBody className="p-4">
          <div className="space-y-3">
            <Skeleton className="w-3/4 h-6 rounded-lg" />
            <Skeleton className="w-full h-16 rounded-lg" />
            <Skeleton className="w-1/2 h-8 rounded-lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!currentProduct || visibleProducts.length === 0) {
    return null; // Don't show anything if no products available
  }

  const getProductImage = (product: TenantProduct): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return "https://img.heroui.chat/image/medicine?w=200&h=200&u=default";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProduct.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border border-content3 relative overflow-hidden">
            <Button 
              isIconOnly 
              size="sm" 
              variant="light" 
              className="absolute top-2 right-2 z-10 bg-content1/80 backdrop-blur-sm"
              onPress={() => handleDismiss(currentProduct.id)}
              aria-label="Dismiss"
            >
              <Icon icon="lucide:x" />
            </Button>
            
            <CardBody className="p-4">
              <div className="relative pb-16">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <Icon icon="lucide:sparkles" className="text-lg text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-medium mb-1">{currentProduct.name}</h2>
                    <p className="text-sm text-foreground-500 line-clamp-2 mb-2">
                      {currentProduct.description || "Enhance your wellness journey with this recommended product."}
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      ${Number(currentProduct.price).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    {visibleProducts.length > 1 && (
                      <>
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat"
                          onPress={handlePrevious}
                          aria-label="Previous product"
                        >
                          <Icon icon="lucide:chevron-left" />
                        </Button>
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat"
                          onPress={handleNext}
                          aria-label="Next product"
                        >
                          <Icon icon="lucide:chevron-right" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button size="sm" variant="flat" color="primary">
                    Learn more
                  </Button>
                </div>

                {/* Product count indicator */}
                {visibleProducts.length > 1 && (
                  <div className="flex gap-1 justify-center mt-3">
                    {visibleProducts.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? "bg-primary" : "bg-content3"
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Product image - positioned bottom right */}
                <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-20">
                  <img 
                    src={getProductImage(currentProduct)} 
                    alt={currentProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

