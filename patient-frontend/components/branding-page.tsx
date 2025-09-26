import React from "react";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader, Input, Button, Avatar, Divider, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "../contexts/AuthContext";
import { apiCall } from "../lib/api";

interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export const BrandingPage: React.FC = () => {
  const { user } = useAuth();
  const [clinic, setClinic] = React.useState<Clinic | null>(null);
  const [clinicName, setClinicName] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const [message, setMessage] = React.useState("");

  // Load clinic data when component mounts
  React.useEffect(() => {
    const loadClinicData = async () => {
      if (!user?.clinicId) {
        setIsLoadingData(false);
        return;
      }

      try {
        const result = await apiCall(`/clinic/${user.clinicId}`);
        if (result.success && result.data && result.data.data) {
          // The actual clinic data is nested in result.data.data due to apiCall wrapper
          const clinicData = result.data.data as Clinic;
          
          setClinic(clinicData);
          setClinicName(clinicData.name);
          setLogoUrl(clinicData.logo || "");
        } else {
          console.error('❌ API call failed or no data:', result);
          setMessage("Failed to load clinic data");
        }
      } catch (error) {
        console.error('Failed to load clinic data:', error);
        setMessage("Failed to load clinic data");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadClinicData();
  }, [user]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage("Invalid file type. Please select a JPEG, PNG, or WebP image.");
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setMessage("File too large. Please select an image smaller than 5MB.");
        return;
      }

      setSelectedFile(file);
      setMessage("");
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedFile || !clinic) {
      return;
    }

    setIsUploadingLogo(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);

      // For FormData, we need to make a direct fetch call instead of using apiCall
      // because apiCall sets JSON headers which conflict with FormData
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      
      const response = await fetch(`${apiUrl}/clinic/${clinic.id}/upload-logo`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const updatedClinic = result.data as Clinic;
        setClinic(updatedClinic);
        setLogoUrl(updatedClinic.logo);
        setSelectedFile(null);
        setMessage("Logo uploaded successfully!");
        
        // Reset file input
        const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(result.message || "Failed to upload logo");
      }
    } catch (error) {
      setMessage("Failed to upload logo. Please try again.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!clinic) {
      setMessage("No clinic data found");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await apiCall(`/clinic/${clinic.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: clinicName.trim(),
          logo: logoUrl.trim(),
        }),
      });

      if (result.success && result.data && result.data.data) {
        setMessage("Branding updated successfully!");
        // Update local clinic state with response from server (includes updated slug)
        const updatedClinic = result.data.data as Clinic;
        setClinic(updatedClinic);
      } else {
        setMessage(result.error || "Failed to update branding");
      }
    } catch (error) {
      setMessage("Failed to update branding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while fetching clinic data
  if (isLoadingData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center h-64"
      >
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-foreground-600">Loading clinic data...</p>
        </div>
      </motion.div>
    );
  }

  // Show message if no clinic is associated with user
  if (!user?.clinicId || !clinic) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        <Card>
          <CardBody className="text-center py-12">
            <Icon icon="lucide:building" className="text-6xl text-foreground-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Clinic Found</h2>
            <p className="text-foreground-600">
              You don't have a clinic associated with your account. Please contact support if this is an error.
            </p>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Clinic Branding</h1>
        <p className="text-foreground-600">
          Customize your clinic's appearance and branding information
        </p>
      </div>

      {/* Current Branding Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:eye" className="text-lg text-primary" />
            <h2 className="text-lg font-semibold">Preview</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4 p-4 bg-content2 rounded-lg">
            <Avatar
              src={logoUrl || undefined}
              icon={!logoUrl ? <Icon icon="lucide:building" className="text-2xl" /> : undefined}
              className="w-16 h-16"
              classNames={{
                base: logoUrl ? "" : "bg-primary-100",
                icon: "text-primary-600"
              }}
            />
            <div>
              <h3 className="text-xl font-semibold">{clinicName || "Your Clinic Name"}</h3>
              <p className="text-foreground-500">Healthcare Provider</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Branding Settings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:settings" className="text-lg text-primary" />
            <h2 className="text-lg font-semibold">Branding Settings</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Clinic Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Clinic Name
            </label>
            <Input
              value={clinicName}
              onValueChange={setClinicName}
              placeholder="Enter your clinic name"
              startContent={<Icon icon="lucide:building" className="text-foreground-400" />}
              variant="bordered"
              isRequired
            />
            <p className="text-xs text-foreground-500">
              This name will be displayed throughout the application
            </p>
          </div>

          {/* Clinic Slug (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Clinic URL Slug
            </label>
            <Input
              value={clinic?.slug || ""}
              placeholder="clinic-slug"
              startContent={<Icon icon="lucide:link" className="text-foreground-400" />}
              variant="bordered"
              isReadOnly
              className="opacity-75"
            />
            <p className="text-xs text-foreground-500">
              This slug is automatically generated from your clinic name and used in URLs. It updates when you change the clinic name.
            </p>
          </div>

          <Divider />

          {/* Logo Upload */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">
              Clinic Logo
            </label>
            
            {/* Current Logo Display */}
            {logoUrl && (
              <div className="flex items-center gap-3 p-3 bg-content2 rounded-lg">
                <Avatar
                  src={logoUrl}
                  className="w-12 h-12"
                  classNames={{
                    base: "bg-primary-100",
                    icon: "text-primary-600"
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Current Logo</p>
                  <p className="text-xs text-foreground-500">Click "Choose File" to replace</p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-3">
              <input
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex gap-2">
                <Button
                  variant="bordered"
                  onPress={() => document.getElementById('logo-upload')?.click()}
                  startContent={<Icon icon="lucide:upload" />}
                  className="flex-1"
                >
                  Choose File
                </Button>
                
                {selectedFile && (
                  <Button
                    color="primary"
                    onPress={handleLogoUpload}
                    isLoading={isUploadingLogo}
                    startContent={!isUploadingLogo ? <Icon icon="lucide:cloud-upload" /> : undefined}
                  >
                    {isUploadingLogo ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-foreground-600">
                  <Icon icon="lucide:file-image" className="text-primary" />
                  <span>{selectedFile.name}</span>
                  <span className="text-foreground-400">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-foreground-500">
              Supported formats: JPEG, PNG, WebP. Maximum size: 5MB. Recommended size: 200x200px for best results.
            </p>
          </div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-sm ${
                message.includes("success") 
                  ? "bg-success-50 text-success-600 border border-success-200"
                  : "bg-danger-50 text-danger-600 border border-danger-200"
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={isLoading}
              startContent={!isLoading ? <Icon icon="lucide:save" /> : undefined}
              className="px-6"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:info" className="text-lg text-primary" />
            <h2 className="text-lg font-semibold">Guidelines</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3 text-sm text-foreground-600">
            <div className="flex items-start gap-2">
              <Icon icon="lucide:check" className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>Use high-quality images for the best appearance</span>
            </div>
            <div className="flex items-start gap-2">
              <Icon icon="lucide:check" className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>Logo should be in PNG or JPG format</span>
            </div>
            <div className="flex items-start gap-2">
              <Icon icon="lucide:check" className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>Recommended logo dimensions: 200x200 pixels (square)</span>
            </div>
            <div className="flex items-start gap-2">
              <Icon icon="lucide:check" className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>Ensure your logo has appropriate contrast for visibility</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};