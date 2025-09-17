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
} from "lucide-react";
import {
  useLoginMutation,
  setAdmin,
  setError,
  clearError,
  initializeAuth,
} from "@/lib/features/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Redux hooks
  const dispatch = useAppDispatch();
  const { admin, isAdminAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Redux mutations
  const [adminLogin, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize auth state on component mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated && admin) {
      router.push("/admin/dashboard");
    }
  }, [isAdminAuthenticated, admin, router]);

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
      const result = await adminLogin({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      if (result.success) {
        dispatch(setAdmin(result.data.user));
        setSuccessMessage("Admin login successful!");
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      dispatch(setError(error.data?.message || "Admin login failed"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success Messages */}
            {successMessage && (
              <Alert className="border-emerald-200 bg-emerald-50/90 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {(error || loginError) && (
              <Alert variant="destructive" className="bg-red-500/90 backdrop-blur-sm border-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white">
                  {error || (loginError as any)?.data?.message || "Login failed"}
                </AlertDescription>
              </Alert>
            )}

            {/* Admin Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your admin email"
                    className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400 ${
                      formErrors.email ? "border-red-400 focus:border-red-400" : ""
                    }`}
                    disabled={isPending}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-red-300">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400 ${
                      formErrors.password ? "border-red-400 focus:border-red-400" : ""
                    }`}
                    disabled={isPending}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-300"
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
                  <p className="text-sm text-red-300">{formErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
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
                className="text-slate-300 hover:text-white p-0 h-auto"
                disabled={isPending}
              >
                ← Back to main site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
