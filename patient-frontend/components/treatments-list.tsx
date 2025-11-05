import React, { useEffect, useState } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { apiCall } from "../lib/api";

interface Treatment {
  id: string;
  name: string;
  subtitle: string;
  placeholderSig: string;
  refills: number;
  status: "paused" | "active" | "cancelled";
  expiryDate: string;
  image: string;
}

export const TreatmentsList: React.FC = () => {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await apiCall('/getProductsByTreatment');
        
        if (response.success && response.data?.data) {
          console.log('✅ Products loaded:', response.data.data);
          setTreatments(response.data.data);
        } else {
          console.error('❌ Failed to load products');
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "paused":
        return "Paused";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Treatments</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Icon icon="lucide:loader-2" className="animate-spin text-primary" width={32} height={32} />
        </div>
      </div>
    );
  }

  if (treatments.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Treatments</h2>
        </div>
        <Card className="border border-content3">
          <CardBody className="p-8 text-center">
            <Icon icon="lucide:package" className="mx-auto mb-3 text-foreground-400" width={48} height={48} />
            <p className="text-foreground-600">No active treatments</p>
            <p className="text-sm text-foreground-500 mt-1">Your treatment products will appear here</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Treatments</h2>
        <Button variant="light" size="sm" className="text-primary">
          View all
        </Button>
      </div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {treatments.map((treatment) => (
          <motion.div key={treatment.id} variants={item}>
            <Card className="border border-content3">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md overflow-hidden">
                    <img 
                      src={treatment.image} 
                      alt={treatment.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{treatment.name}</h3>
                        <p className="text-sm text-foreground-600">{treatment.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Chip 
                          color={getStatusColor(treatment.status) as any} 
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(treatment.status)}
                        </Chip>
                        <Button isIconOnly variant="light" size="sm">
                          <Icon icon="lucide:chevron-down" className="text-foreground-500" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-foreground-500">
                      <p>{treatment.placeholderSig}</p>
                      <p>{treatment.refills} refills left</p>
                    </div>
                    
                    <div className="mt-2 flex items-center text-xs text-foreground-500">
                      <Icon icon="lucide:calendar" className="mr-1" width={14} height={14} />
                      Prescription expires on {treatment.expiryDate}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};