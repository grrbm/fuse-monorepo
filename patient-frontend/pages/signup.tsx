import React from "react";
import { motion } from "framer-motion";
import { Button, Input, Card, CardBody, Checkbox, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authApi, apiCall } from "../lib/api";
import { extractClinicSlugFromDomain } from "../lib/clinic-utils";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  phoneNumber: string;
  clinicName: string;
}

interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export default function SignUp() {
  const [formData, setFormData] = React.useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    phoneNumber: "",
    clinicName: "",
  });
  const [clinic, setClinic] = React.useState<Clinic | null>(null);
  const [loadingClinic, setLoadingClinic] = React.useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [passwordStrength, setPasswordStrength] = React.useState(0);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [agreedToHipaa, setAgreedToHipaa] = React.useState(false);
  const router = useRouter();

  // Load clinic data based on subdomain
  React.useEffect(() => {
    const loadClinicFromSubdomain = async () => {
      setLoadingClinic(true);
      try {
        const domainInfo = extractClinicSlugFromDomain();

        if (domainInfo.hasClinicSubdomain && domainInfo.clinicSlug) {
          console.log('🏥 Detected clinic slug from subdomain:', domainInfo.clinicSlug);

          const result = await apiCall(`/clinic/by-slug/${domainInfo.clinicSlug}`);
          if (result.success && result.data && result.data.data) {
            const clinicData = result.data.data as Clinic;
            setClinic(clinicData);
            console.log('✅ Loaded clinic data:', result);
            console.log('🏥 Extracted clinic data:', clinicData);
          } else {
            console.error('❌ Failed to load clinic data:', result);
          }
        }
      } catch (error) {
        console.error('❌ Error loading clinic data:', error);
      } finally {
        setLoadingClinic(false);
      }
    };

    loadClinicFromSubdomain();
  }, []);

  // Password strength validation (HIPAA requires strong passwords)
  const validatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Update password strength in real-time
    if (field === 'password') {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const validateForm = (): string | null => {
    // Required fields validation
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];

    // Add clinic name as required for providers (main domain signups)
    if (!clinic) {
      requiredFields.push('clinicName');
    }

    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        return `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Password strength validation
    if (passwordStrength < 4) {
      return 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    // HIPAA consent validation
    if (!agreedToTerms || !agreedToHipaa) {
      return 'You must agree to the Terms of Service and HIPAA Privacy Notice';
    }

    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await authApi.signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: clinic ? 'patient' : 'provider', // Patient for clinic signups, provider for main domain
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        ...(clinic && { clinicId: clinic.id }), // Associate with clinic if detected
        ...(!clinic && { clinicName: formData.clinicName }), // Include clinic name for provider signups
      });

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      // Redirect to signin page with success message
      router.push('/signin?message=Registration successful. Please sign in.');

    } catch (err) {
      // HIPAA Compliance: Don't log actual error which might contain PHI
      console.error('Registration error occurred');
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
      // Clear passwords for security
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "danger";
    if (passwordStrength === 3) return "warning";
    return "success";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  // Show loading state while determining if this is a clinic subdomain
  if (loadingClinic) {
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
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-content2 rounded-full flex items-center justify-center">
                    <Icon icon="lucide:loader-2" className="text-2xl text-primary animate-spin" />
                  </div>
                </div>
                <div>
                  <div className="h-6 bg-content2 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 bg-content2 rounded-lg w-3/4 mx-auto animate-pulse"></div>
                </div>
                <p className="text-foreground-500 text-sm">
                  Loading clinic information...
                </p>
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
        className="w-full max-w-2xl"
      >
        <Card className="w-full">
          <CardBody className="p-6 md:p-8">
            {/* Logo and Title */}
            <div className="text-center mb-6">
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
                    <p className="text-foreground-600">Sign Up as a Patient</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-2xl text-foreground mb-2">
                    <span className="text-primary">Fuse</span> Health
                  </div>
                  <p className="text-foreground-600">Sign Up as a Provider</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-lg text-sm mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="First Name"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onValueChange={(value) => handleInputChange('firstName', value)}
                  startContent={<Icon icon="lucide:user" className="text-foreground-400" />}
                  variant="bordered"
                  isRequired
                />
                <Input
                  type="text"
                  label="Last Name"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onValueChange={(value) => handleInputChange('lastName', value)}
                  startContent={<Icon icon="lucide:user" className="text-foreground-400" />}
                  variant="bordered"
                  isRequired
                />
              </div>

              {/* Email */}
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email address"
                value={formData.email}
                onValueChange={(value) => handleInputChange('email', value)}
                startContent={<Icon icon="lucide:mail" className="text-foreground-400" />}
                variant="bordered"
                isRequired
              />

              {/* Clinic Name - Only for provider signups (main domain) */}
              {!clinic && (
                <Input
                  type="text"
                  label="Clinic Name"
                  placeholder="Enter your clinic or practice name"
                  value={formData.clinicName}
                  onValueChange={(value) => handleInputChange('clinicName', value)}
                  startContent={<Icon icon="lucide:building" className="text-foreground-400" />}
                  variant="bordered"
                  isRequired
                />
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onValueChange={(value) => handleInputChange('dateOfBirth', value)}
                  startContent={<Icon icon="lucide:calendar" className="text-foreground-400" />}
                  variant="bordered"
                />
                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  value={formData.phoneNumber}
                  onValueChange={(value) => handleInputChange('phoneNumber', value)}
                  startContent={<Icon icon="lucide:phone" className="text-foreground-400" />}
                  variant="bordered"
                />
              </div>

              {/* Password */}
              <Input
                label="Password"
                placeholder="Create a strong password"
                value={formData.password}
                onValueChange={(value) => handleInputChange('password', value)}
                startContent={<Icon icon="lucide:lock" className="text-foreground-400" />}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Icon
                      icon={isPasswordVisible ? "lucide:eye-off" : "lucide:eye"}
                      className="text-foreground-400"
                    />
                  </button>
                }
                type={isPasswordVisible ? "text" : "password"}
                variant="bordered"
                isRequired
              />

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Password Strength:</span>
                    <span className={`font-medium text-${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-content3 rounded-full h-2">
                    <div
                      className={`bg-${getPasswordStrengthColor()} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onValueChange={(value) => handleInputChange('confirmPassword', value)}
                startContent={<Icon icon="lucide:lock" className="text-foreground-400" />}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  >
                    <Icon
                      icon={isConfirmPasswordVisible ? "lucide:eye-off" : "lucide:eye"}
                      className="text-foreground-400"
                    />
                  </button>
                }
                type={isConfirmPasswordVisible ? "text" : "password"}
                variant="bordered"
                isRequired
              />

              {/* HIPAA Compliance Checkboxes */}
              <div className="space-y-3 pt-4">
                <Checkbox
                  isSelected={agreedToTerms}
                  onValueChange={setAgreedToTerms}
                  color="primary"
                  size="sm"
                >
                  <span className="text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </Checkbox>

                <Checkbox
                  isSelected={agreedToHipaa}
                  onValueChange={setAgreedToHipaa}
                  color="primary"
                  size="sm"
                >
                  <span className="text-sm">
                    I acknowledge that I have read and understand the{" "}
                    <Link href="/hipaa-notice" className="text-primary hover:underline">
                      HIPAA Privacy Notice
                    </Link>{" "}
                    regarding the use and disclosure of my protected health information
                  </span>
                </Checkbox>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                isDisabled={!agreedToTerms || !agreedToHipaa}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <span className="text-foreground-600">Already have an account? </span>
              <Link href="/signin">
                <span className="text-primary hover:text-primary-600 cursor-pointer font-medium">
                  Sign in
                </span>
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}