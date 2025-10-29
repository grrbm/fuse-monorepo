import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  Input, 
  Tabs, 
  Tab,
  Divider,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiCall, ApiResponse } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { getClinicSlugFromDomain } from "../hooks/useClinicFromDomain";
import { QuestionnaireModal } from "./QuestionnaireModal";
import { OrderTrackingCard } from "./OrderTrackingCard";

interface Treatment {
  id: string;
  name: string;
  treatmentLogo?: string;
  subtitle?: string;
  dosage?: string;
  refills?: number;
  status?: "paused" | "active" | "cancelled";
  expiryDate?: string;
  image?: string;
  doctor?: {
    name: string;
    specialty: string;
    avatar: string;
  };
  instructions?: string;
  nextRefillDate?: string;
}

export const TreatmentsPage: React.FC = () => {
  const [treatments, setTreatments] = React.useState<Treatment[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(true);
  const [editingTreatment, setEditingTreatment] = React.useState<Treatment | null>(null);
  const [treatmentName, setTreatmentName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [savingTreatment, setSavingTreatment] = React.useState(false);
  const [selectedTreatmentForQuestionnaire, setSelectedTreatmentForQuestionnaire] = React.useState<Treatment | null>(null);
  const { user } = useAuth();
  
  // Modal controls
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onOpenChange: onAddModalOpenChange } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onOpenChange: onEditModalOpenChange } = useDisclosure();
  const { isOpen: isQuestionnaireModalOpen, onOpen: onQuestionnaireModalOpen, onOpenChange: onQuestionnaireModalOpenChange } = useDisclosure();

  useEffect(() => {
    setIsLoading(false);
  }, [treatments]);
  
  // Function to get clinic slug from subdomain

  // Load treatments for clinic
  // React.useEffect(() => {
  //   const initialLoadTreatments = async () => {
  //     if (!user) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     setIsLoading(true);
  //     await loadTreatments();
  //     setIsLoading(false);
  //   };

  //   initialLoadTreatments();
  // }, [user]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("all");

  // Handle opening edit modal
  const handleEditTreatment = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setTreatmentName(treatment.name);
    setSelectedFile(null);
    onEditModalOpen();
  };

  const fetchTreatments = async () => {
    if (!user) return;
    
    const response = await apiCall('/getTreatments');
    
    if (response.success && response.data?.data) {
      setTreatments(response.data.data);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoadingOrders(true);
    try {
      const response = await apiCall('/orders');
      
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  React.useEffect(() => {
    fetchTreatments();
    fetchOrders();
  }, [user]);
  // Handle opening add modal
  const handleAddTreatment = () => {
    setEditingTreatment(null);
    setTreatmentName("");
    setSelectedFile(null);
    onAddModalOpen();
  };

  // Handle opening questionnaire modal
  const handleOpenQuestionnaire = (treatment: Treatment) => {
    setSelectedTreatmentForQuestionnaire(treatment);
    onQuestionnaireModalOpen();
  };

  // Handle closing questionnaire modal
  const handleCloseQuestionnaire = () => {
    setSelectedTreatmentForQuestionnaire(null);
    onQuestionnaireModalOpenChange();
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Upload logo to treatment
  const uploadTreatmentLogo = async (treatmentId: string): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/treatment/${treatmentId}/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        return result.data.treatmentLogo;
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save new treatment
  const handleSaveNewTreatment = async () => {
    if (!treatmentName.trim()) {
      alert('Please enter a treatment name');
      return;
    }

    setSavingTreatment(true);
    try {
      // Create treatment first
      const result = await apiCall('/treatments', {
        method: 'POST',
        body: JSON.stringify({ name: treatmentName }),
      });

      if (result.success) {
        const newTreatment = result.data;

        // Upload logo if one was selected
        if (selectedFile) {
          const logoUrl = await uploadTreatmentLogo(newTreatment.id);
          console.log('📷 Logo upload result:', logoUrl);
          if (logoUrl) {
            newTreatment.treatmentLogo = logoUrl;
            console.log('📷 Updated treatment object:', newTreatment);
          }
        }

        // Add the new treatment to the local state immediately
        setTreatments(prevTreatments => [...prevTreatments, newTreatment]);

        // Close modal and reset form
        onAddModalOpenChange();
        setTreatmentName("");
        setSelectedFile(null);
        
        alert('Treatment created successfully!');
      } else {
        throw new Error(result.error || 'Failed to create treatment');
      }
    } catch (error) {
      console.error('Error creating treatment:', error);
      alert('Failed to create treatment');
    } finally {
      setSavingTreatment(false);
    }
  };

  // Save edited treatment
  const handleSaveEditedTreatment = async () => {
    if (!editingTreatment || !treatmentName.trim()) {
      alert('Please enter a treatment name');
      return;
    }

    setSavingTreatment(true);
    try {
      // Update treatment name
      const result = await apiCall(`/treatments/${editingTreatment.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: treatmentName }),
      });

      if (result.success) {
        let logoUrl = editingTreatment.treatmentLogo;
        
        // Upload logo if one was selected
        if (selectedFile) {
          const newLogoUrl = await uploadTreatmentLogo(editingTreatment.id);
          console.log('📷 Edit logo upload result:', newLogoUrl);
          if (newLogoUrl) {
            logoUrl = newLogoUrl;
            console.log('📷 Updated logo URL:', logoUrl);
          }
        }

        // Update the treatment in local state immediately
        setTreatments(prevTreatments => 
          prevTreatments.map(treatment => 
            treatment.id === editingTreatment.id 
              ? { ...treatment, name: treatmentName.trim(), treatmentLogo: logoUrl }
              : treatment
          )
        );

        // Close modal and reset form
        onEditModalOpenChange();
        setEditingTreatment(null);
        setTreatmentName("");
        setSelectedFile(null);
        
        alert('Treatment updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update treatment');
      }
    } catch (error) {
      console.error('Error updating treatment:', error);
      alert('Failed to update treatment');
    } finally {
      setSavingTreatment(false);
    }
  };

  // Extract loadTreatments function for reuse
  // const loadTreatments = async () => {
  //   if (!user) return;

  //   try {
  //     let result: ApiResponse<any> | undefined;
      
  //     // If user is a doctor with a clinicId, fetch by clinic ID
  //     if (user.role === 'doctor' && user.clinicId) {
  //       result = await apiCall(`/treatments/by-clinic-id/${user.clinicId}`);
  //     } else {
  //       // Otherwise, try to get by clinic slug from subdomain
  //       const clinicSlug = getClinicSlugFromDomain();
  //       if (clinicSlug) {
  //         result = await apiCall(`/treatments/by-clinic-slug/${clinicSlug}`);
  //       }
  //     }

  //     if (result && result.success && result.data) {
  //       setTreatments(result.data.data || result.data || []);
  //     }
  //   } catch (error) {
  //     console.error('Error loading treatments:', error);
  //   }
  // };

  const filteredTreatments = React.useMemo(() => {
    return treatments
      .filter(treatment => {
        // Filter by search query
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          treatment.name.toLowerCase().includes(query) ||
          (treatment.subtitle && treatment.subtitle.toLowerCase().includes(query));

        // Get treatment status
        let treatmentStatus = "active";
        if (typeof treatment.status === "string") {
          treatmentStatus = treatment.status;
        }

        // Filter by tab
        const matchesTab =
          selectedTab === "all" ||
          treatmentStatus === selectedTab;

        return matchesSearch && matchesTab;
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
  }, [treatments, searchQuery, selectedTab]);

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

  // Helper to get treatment status from active field or status field
  const getTreatmentDisplayStatus = (treatment: Treatment): string => {
    if (treatment.status) {
      return treatment.status;
    }
    // If no status field, use active boolean
    return treatment.status || "active";
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0"
      >
        <h1 className="text-2xl font-semibold">Treatments & Orders</h1>
        <Button 
          color="primary"
          startContent={<Icon icon="lucide:plus" />}
          size="sm"
          className="sm:size-md w-full sm:w-auto"
          onPress={user?.role === 'doctor' ? handleAddTreatment : undefined}
        >
          {user?.role === 'doctor' ? 'Add New Treatment' : 'Request New Treatment'}
        </Button>
      </motion.div>

      {/* Active Orders Section - Only show for patients */}
      {user?.role !== 'doctor' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          {isLoadingOrders ? (
            <Card className="border border-content3">
              <CardBody className="p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Icon icon="lucide:loader-2" className="text-3xl text-primary animate-spin" />
                </div>
                <p className="text-foreground-500">Loading your orders...</p>
              </CardBody>
            </Card>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderTrackingCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Card className="border border-content3">
              <CardBody className="p-8 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-content2">
                    <Icon icon="lucide:package-open" className="text-3xl text-foreground-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-1">No Orders Yet</h3>
                <p className="text-foreground-500">
                  When you order treatments, you'll see them here with tracking information
                </p>
              </CardBody>
            </Card>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border border-content3">
          <CardBody className="p-3 sm:p-4">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <Input
                  placeholder="Search treatments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Icon icon="lucide:search" className="text-foreground-400" />}
                  isClearable
                  onClear={() => setSearchQuery("")}
                  size="sm"
                  className="sm:size-md"
                />
              </div>
              {user?.role !== 'doctor' && (
                <Tabs 
                  selectedKey={selectedTab} 
                  onSelectionChange={(key) => setSelectedTab(key as string)}
                  variant="light"
                  color="primary"
                  classNames={{
                    base: "w-full",
                    tabList: "gap-2 overflow-x-auto flex-nowrap"
                  }}
                  size="sm"
                >
                  <Tab key="all" title="All Treatments" />
                  <Tab key="active" title="Active" />
                  <Tab key="paused" title="Paused" />
                  <Tab key="cancelled" title="Cancelled" />
                </Tabs>
              )}
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4 mt-4"
            >
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-content2">
                      <Icon icon="lucide:loader-2" className="text-3xl text-primary animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">Loading treatments...</h3>
                  <p className="text-foreground-500">Please wait while we fetch your treatments</p>
                </div>
              ) : filteredTreatments.length > 0 ? (
                filteredTreatments.map((treatment) => (
                  <motion.div key={treatment.id} variants={item}>
                    <Card className="border border-content3">
                      <CardBody className="p-3 sm:p-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-3">
                            <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                              <img 
                                src={treatment.treatmentLogo || treatment.image || "https://img.heroui.chat/image/medicine?w=100&h=100&u=default"} 
                                alt={treatment.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap gap-2 items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-lg">{treatment.name}</h3>
                                  <p className="text-foreground-600 text-sm">{treatment.subtitle || "Treatment"}</p>
                                </div>
                                <Chip 
                                  color={getStatusColor(getTreatmentDisplayStatus(treatment)) as any} 
                                  variant="flat"
                                  size="sm"
                                >
                                  {getStatusLabel(getTreatmentDisplayStatus(treatment))}
                                </Chip>
                              </div>
                            </div>
                          </div>
                          
                          <Divider className="my-1" />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Treatment Details</h4>
                              <div className="space-y-1 text-sm">
                                <p className="flex items-center gap-2">
                                  <Icon icon="lucide:pill" className="text-foreground-500" />
                                  <span className="text-foreground-600">Dosage:</span> {treatment.dosage || "As prescribed"}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Icon icon="lucide:repeat" className="text-foreground-500" />
                                  <span className="text-foreground-600">Refills:</span> {treatment.refills || 0} remaining
                                </p>
                                <p className="flex items-center gap-2">
                                  <Icon icon="lucide:calendar" className="text-foreground-500" />
                                  <span className="text-foreground-600">Expires:</span> {treatment.expiryDate || "N/A"}
                                </p>
                                {treatment.nextRefillDate && (
                                  <p className="flex items-center gap-2">
                                    <Icon icon="lucide:calendar-clock" className="text-foreground-500" />
                                    <span className="text-foreground-600">Next Refill:</span> {treatment.nextRefillDate}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Prescribing Doctor</h4>
                              <div className="flex items-center gap-3">
                                <Avatar src={treatment.doctor?.avatar || "https://img.heroui.chat/image/avatar?w=200&h=200&u=default"} size="sm" />
                                <div>
                                  <p className="font-medium">{treatment.doctor?.name || "Dr. Unknown"}</p>
                                  <p className="text-sm text-foreground-500">{treatment.doctor?.specialty || "General Medicine"}</p>
                                </div>
                              </div>
                              
                              <h4 className="text-sm font-medium mt-3 mb-1">Instructions</h4>
                              <p className="text-sm text-foreground-600">{treatment.instructions || "No instructions available"}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {user?.role === 'doctor' ? (
                                // Doctor actions
                                <>
                                  <Button 
                                    size="sm" 
                                    color="primary"
                                    variant="flat"
                                    startContent={<Icon icon="lucide:edit" />}
                                    className="flex-1 sm:flex-none"
                                    onPress={() => handleEditTreatment(treatment)}
                                  >
                                    Edit Treatment
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="light"
                                    startContent={<Icon icon="lucide:trash-2" />}
                                    className="flex-1 sm:flex-none"
                                    color="danger"
                                  >
                                    Delete
                                  </Button>
                                </>
                              ) : (
                                // Patient actions
                                <>
                                  {getTreatmentDisplayStatus(treatment) === "active" && (
                                    <Button 
                                      size="sm" 
                                      color="primary"
                                      variant="flat"
                                      startContent={<Icon icon="lucide:refresh-cw" />}
                                      className="flex-1 sm:flex-none"
                                      onPress={() => {
                                        // Check if this is a treatment with a questionnaire
                                        if (treatment.name.includes("NAD+") || treatment.name === "Weight Loss 2" || treatment.name.includes("Weight Loss")) {
                                          handleOpenQuestionnaire(treatment);
                                        } else {
                                          // For other treatments, show regular refill request
                                          alert("Refill request submitted for " + treatment.name);
                                        }
                                      }}
                                    >
                                      Request Refill
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="light"
                                    startContent={<Icon icon="lucide:message-square" />}
                                    className="flex-1 sm:flex-none"
                                  >
                                    Contact Doctor
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-content2">
                      <Icon icon="lucide:search-x" className="text-3xl text-foreground-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">No treatments found</h3>
                  <p className="text-foreground-500">
                    {searchQuery || selectedTab !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "No treatments available for your clinic"}
                  </p>
                </div>
              )}
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Add Treatment Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onOpenChange={onAddModalOpenChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add New Treatment</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Treatment Name"
                  placeholder="Enter treatment name"
                  value={treatmentName}
                  onValueChange={setTreatmentName}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Treatment Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {selectedFile && (
                    <p className="text-sm text-foreground-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSaveNewTreatment}
                  isLoading={savingTreatment || uploadingLogo}
                  isDisabled={!treatmentName.trim()}
                >
                  {uploadingLogo ? 'Uploading...' : savingTreatment ? 'Creating...' : 'Add Treatment'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Treatment Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onOpenChange={onEditModalOpenChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Edit Treatment</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Treatment Name"
                  placeholder="Enter treatment name"
                  value={treatmentName}
                  onValueChange={setTreatmentName}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Treatment Logo</label>
                  {editingTreatment?.treatmentLogo && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={editingTreatment.treatmentLogo} 
                        alt="Current logo" 
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <span className="text-sm text-foreground-600">Current logo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {selectedFile && (
                    <p className="text-sm text-foreground-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSaveEditedTreatment}
                  isLoading={savingTreatment || uploadingLogo}
                  isDisabled={!treatmentName.trim()}
                >
                  {uploadingLogo ? 'Uploading...' : savingTreatment ? 'Saving...' : 'Save Changes'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Questionnaire Modal */}
      {selectedTreatmentForQuestionnaire && (
        <QuestionnaireModal
          isOpen={isQuestionnaireModalOpen}
          onClose={handleCloseQuestionnaire}
          treatmentId={selectedTreatmentForQuestionnaire.id}
          treatmentName={selectedTreatmentForQuestionnaire.name}
        />
      )}
    </div>
  );
};