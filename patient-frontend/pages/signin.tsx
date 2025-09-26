import React from "react";
import { motion } from "framer-motion";
import { Button, Input, Card, CardBody, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authApi, apiCall } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { extractClinicSlugFromDomain } from "../lib/clinic-utils";

interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo: string;
}


export default function SignIn() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [clinic, setClinic] = React.useState<Clinic | null>(null);
  const [loadingClinic, setLoadingClinic] = React.useState(true);
  const [loadingLogo, setLoadingLogo] = React.useState(false);
  const [clinicNotFound, setClinicNotFound] = React.useState(false);
  const [hasClinicSubdomain, setHasClinicSubdomain] = React.useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Function to preload logo image
  const preloadLogoImage = (logoUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!logoUrl) {
        resolve(); // No logo to load
        return;
      }

      const img = new Image();
      img.onload = () => {
        console.log('✅ Logo image loaded successfully:', logoUrl);
        resolve();
      };
      img.onerror = () => {
        console.log('⚠️ Logo image failed to load:', logoUrl);
        resolve(); // Still resolve so UI doesn't hang
      };
      img.src = logoUrl;
    });
  };

  // Load clinic data based on subdomain
  React.useEffect(() => {
    const loadClinicFromSubdomain = async () => {
      setLoadingClinic(true);
      try {
        const domainInfo = extractClinicSlugFromDomain();

        if (domainInfo.hasClinicSubdomain && domainInfo.clinicSlug) {
          setHasClinicSubdomain(true);

          console.log('🏥 Detected clinic slug from subdomain:', domainInfo.clinicSlug);

          const result = await apiCall(`/clinic/by-slug/${domainInfo.clinicSlug}`);
          if (result.success && result.data && result.data.data) {
            const clinicData = result.data.data as Clinic;
            console.log('✅ Loaded clinic data:', result);
            console.log('🏥 Extracted clinic data:', clinicData);
            console.log('🖼️ Logo URL:', clinicData.logo);
            console.log('🏷️ Clinic name:', clinicData.name);

            // Preload logo image before showing UI
            if (clinicData.logo) {
              setLoadingLogo(true);
              console.log('🖼️ Starting logo preload...');
              await preloadLogoImage(clinicData.logo);
              setLoadingLogo(false);
            }

            setClinic(clinicData);
          } else {
            console.error('❌ Failed to load clinic data:', result);
            setClinicNotFound(true);
          }
        } else {
          // No subdomain detected
          setHasClinicSubdomain(false);
        }
      } catch (error) {
        console.error('❌ Error loading clinic data:', error);
        if (hasClinicSubdomain) {
          setClinicNotFound(true);
        }
      } finally {
        setLoadingClinic(false);
      }
    };

    loadClinicFromSubdomain();
  }, []);

  React.useEffect(() => {
    // Check for success message from signup
    if (router.query.message) {
      setSuccessMessage(router.query.message as string);
    }
  }, [router.query.message]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authApi.signIn(email, password);

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed');
      }

      // Store JWT token in localStorage
      if (result.data?.token) {
        localStorage.setItem('auth_token', result.data.token);
      }

      // Refresh user state and redirect to dashboard
      await refreshUser();
      router.push('/');

    } catch (err) {
      // HIPAA Compliance: Don't log the actual error which might contain PHI
      // Only log sanitized error information for debugging
      console.error('Authentication error occurred');
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
      // Clear password for security
      setPassword("");
    }
  };

  // Show loading state for clinic subdomains (including logo loading)
  if (hasClinicSubdomain && (loadingClinic || loadingLogo)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="w-full">
            <CardBody className="p-6 md:p-8">
              <div className="text-center space-y-6">
                <div className="animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2 mx-auto"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <p className="text-foreground-500 text-sm">
                  {loadingLogo ? 'Loading clinic logo...' : 'Loading clinic information...'}
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show 404 state when clinic subdomain is detected but clinic not found
  if (hasClinicSubdomain && clinicNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="w-full">
            <CardBody className="p-6 md:p-8 text-center">
              <div className="space-y-4">
                <Icon icon="lucide:building-x" className="text-6xl text-danger-500 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Clinic Not Found</h2>
                  <p className="text-foreground-600">
                    The clinic you're looking for could not be found. Please check the URL or contact support.
                  </p>
                </div>
                <Button
                  color="primary"
                  variant="bordered"
                  onPress={() => router.push('http://localhost:3000/signin')}
                  startContent={<Icon icon="lucide:home" />}
                >
                  Go to Main Portal
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardBody className="p-6 md:p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              {clinic ? (
                <div className="space-y-4">
                  {/* Logo */}
                  <div className="flex justify-center">
                    <Avatar
                      src={clinic.logo || undefined}
                      icon={!clinic.logo ? <Icon icon="lucide:building" className="text-4xl" /> : undefined}
                      className="w-20 h-20"
                      classNames={{
                        base: clinic.logo ? "" : "bg-primary-100",
                        icon: "text-primary-600"
                      }}
                    />
                  </div>
                  {/* Clinic Name as Main Title */}
                  <div>
                    <div className="font-bold text-3xl text-foreground mb-2">
                      {clinic.name}
                    </div>
                    <p className="text-foreground-600">Sign in to your account</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-2xl text-foreground mb-2">
                    <span className="text-primary">Fuse</span> Health
                  </div>
                  <p className="text-foreground-600">Sign in to your account</p>
                </div>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-success-50 border border-success-200 text-success-600 px-4 py-3 rounded-lg text-sm"
              >
                {successMessage}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onValueChange={setEmail}
                startContent={
                  <Icon icon="lucide:mail" className="text-foreground-400" />
                }
                variant="bordered"
                isRequired
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onValueChange={setPassword}
                startContent={
                  <Icon icon="lucide:lock" className="text-foreground-400" />
                }
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <Icon
                        icon="lucide:eye-off"
                        className="text-foreground-400"
                      />
                    ) : (
                      <Icon
                        icon="lucide:eye"
                        className="text-foreground-400"
                      />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                variant="bordered"
                isRequired
              />

              <div className="flex items-center justify-between">
                <Link href="/forgot-password">
                  <span className="text-sm text-primary hover:text-primary-600 cursor-pointer">
                    Forgot password?
                  </span>
                </Link>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-content3"></div>
              <span className="px-3 text-sm text-foreground-500">or</span>
              <div className="flex-1 border-t border-content3"></div>
            </div>

            {/* Social Sign In */}
            <div className="space-y-3">
              <Button
                variant="bordered"
                className="w-full"
                startContent={
                  <Icon icon="flat-color-icons:google" className="text-lg" />
                }
              >
                Continue with Google
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <span className="text-foreground-600">Don't have an account? </span>
              <Link href="/signup">
                <span className="text-primary hover:text-primary-600 cursor-pointer font-medium">
                  Sign up
                </span>
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}