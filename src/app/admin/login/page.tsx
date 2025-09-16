"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Building2,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  useAdminLoginMutation,
  setAdmin,
  setError,
  clearError,
  initializeAuth,
  setAuthLoading,
} from "@/lib/features/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Redux hooks
  const dispatch = useAppDispatch();
  const { admin, isAdminAuthenticated, error, isLoading } = useAppSelector((state) => state.auth);

  // Redux mutations
  const [adminLogin, { isLoading: isLoginLoading, error: loginError }] = useAdminLoginMutation();

  // Form state
  const [formData, setFormData] = useState({
    email: "admin@ecommerce.com",
    password: "Admin123!@#",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize auth state on component mount
  useEffect(() => {
    dispatch(initializeAuth());
    
    // Fallback timeout to ensure loading doesn't get stuck
    const timeout = setTimeout(() => {
      console.log("Auth initialization timeout - forcing loading to false");
      dispatch(setAuthLoading(false));
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated && admin && !isLoading) {
      console.log("Admin already authenticated, redirecting to dashboard");
      // Use replace instead of push to prevent back button issues
      router.replace("/admin/dashboard");
    }
  }, [isAdminAuthenticated, admin, router, isLoading]);

  // Debug logging
  useEffect(() => {
    console.log("AdminLogin Debug:", {
      isAdminAuthenticated,
      isLoading,
      admin: admin ? "exists" : "null",
      error,
      timestamp: new Date().toISOString()
    });
  }, [isAdminAuthenticated, isLoading, admin, error]);

  const isPending = isLoginLoading;

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      dispatch(clearError());
      console.log("Attempting admin login...");
      const result = await adminLogin({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      console.log("Admin login result:", result);

      if (result.success) {
        console.log("Setting admin in Redux store:", result.data.admin);
        dispatch(setAdmin(result.data.admin));
        setSuccessMessage("Admin login successful!");
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          console.log("Redirecting to dashboard...");
          router.replace("/admin/dashboard");
        }, 100);
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      dispatch(setError(error.data?.message || "Admin login failed"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing authentication...</p>
          <p className="text-xs text-muted-foreground">Loading state: {isLoading ? 'true' : 'false'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Secure access to your ecommerce management dashboard
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Analytics & Reports</h3>
                  <p className="text-muted-foreground text-sm">Comprehensive business insights</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">User Management</h3>
                  <p className="text-muted-foreground text-sm">Manage customers and permissions</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Inventory Control</h3>
                  <p className="text-muted-foreground text-sm">Products, orders, and fulfillment</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">System Settings</h3>
                  <p className="text-muted-foreground text-sm">Configure your store settings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-lg border bg-background">
              <CardHeader className="space-y-1 text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">
                  Admin Portal
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Sign in to access the admin dashboard
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Success Messages */}
                {successMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Messages */}
                {(error || loginError) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error || (loginError as any)?.data?.message || "Login failed"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Admin Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Admin Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your admin email"
                        className={`pl-10 ${
                          formErrors.email ? "border-destructive focus:border-destructive" : ""
                        }`}
                        disabled={isPending}
                        required
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-sm text-destructive">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className={`pl-10 pr-10 ${
                          formErrors.password ? "border-destructive focus:border-destructive" : ""
                        }`}
                        disabled={isPending}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {formErrors.password && (
                      <p className="text-sm text-destructive">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Access Admin Dashboard"
                    )}
                  </Button>
                </form>

                {/* Back to main site */}
                <div className="text-center pt-4">
                  <Button
                    variant="link"
                    onClick={() => router.push("/")}
                    className="text-muted-foreground hover:text-foreground p-0 h-auto"
                    disabled={isPending}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to main site
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
