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
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  ShoppingCart,
} from "lucide-react";
import {
  useLoginMutation,
  useSignupMutation,
  useForgotPasswordMutation,
  setUser,
  setError,
  clearError,
  initializeAuth,
} from "@/lib/features/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Redux hooks
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Redux mutations
  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading, error: signupError }] = useSignupMutation();
  const [forgotPassword, { isLoading: isForgotPasswordLoading, error: forgotPasswordError }] = useForgotPasswordMutation();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize auth state on component mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);



  const isPending = isLoginLoading || isSignupLoading || isForgotPasswordLoading;

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

    if (mode === "signup") {
      if (!formData.firstName) {
        errors.firstName = "First name is required";
      } else if (formData.firstName.length < 2) {
        errors.firstName = "First name must be at least 2 characters";
      }
      
      if (!formData.lastName) {
        errors.lastName = "Last name is required";
      } else if (formData.lastName.length < 2) {
        errors.lastName = "Last name must be at least 2 characters";
      }
      
      if (formData.phone && !/^\d+$/.test(formData.phone)) {
        errors.phone = "Phone number must contain only digits";
      }
      
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (mode !== "forgot" && !formData.password) {
      errors.password = "Password is required";
    } else if (mode !== "forgot" && formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      dispatch(clearError());
      
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      if (result.success) {
        const user = result.data.user;
        dispatch(setUser(user));
        
        // Redirect based on user role
        if (user.role === 'admin') {
          setSuccessMessage("Admin login successful!");
          router.push("/admin/dashboard");
        } else {
          setSuccessMessage("Login successful!");
          router.push("/account");
        }
      }
    } catch (error: any) {
      dispatch(setError(error.data?.message || "Login failed"));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      dispatch(clearError());
      const signupData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'client'
      };

      // Only include phone if provided
      if (formData.phone) {
        signupData.phone = parseInt(formData.phone);
      }

      const result = await signup(signupData).unwrap();

      if (result.success) {
        dispatch(setUser(result.data.user));
        setSuccessMessage("Account created successfully!");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.data?.message || error.message || "Signup failed";
      dispatch(setError(errorMessage));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      dispatch(clearError());
      const result = await forgotPassword({ email: formData.email }).unwrap();
      setSuccessMessage(result.message);
    } catch (error: any) {
      dispatch(setError(error.data?.message || "Failed to send reset email"));
    }
  };

  const handleDemoLogin = async (type: 'admin' | 'customer') => {
    try {
      dispatch(clearError());
      
      // Demo credentials
      const credentials = type === 'admin' 
        ? { email: 'admin@ecommerce.com', password: 'Admin123!@#' }
        : { email: 'customer2@example.com', password: 'Buyer123!@#' };

      // Auto-fill the form
      setFormData(prev => ({
        ...prev,
        email: credentials.email,
        password: credentials.password
      }));

      // Perform login
      const result = await login(credentials).unwrap();

      if (result.success) {
        const user = result.data.user;
        dispatch(setUser(user));
        
        // Redirect based on user role
        if (user.role === 'admin') {
          setSuccessMessage("Admin demo login successful!");
          router.push("/admin/dashboard");
        } else {
          setSuccessMessage("Customer demo login successful!");
          router.push("/account");
        }
      }
    } catch (error: any) {
      dispatch(setError(error.data?.message || "Demo login failed"));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signup":
        return "Create Account";
      case "signin":
        return "Welcome Back";
      case "forgot":
        return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signup":
        return "Sign up to get started with your account";
      case "signin":
        return "Sign in to your account to continue";
      case "forgot":
        return "Enter your email to receive a password reset link";
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {getDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success Messages */}
            {successMessage && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Sign Up Form */}
            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* First Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className={`pl-3 ${formErrors.firstName ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                    disabled={isPending}
                    required
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className={`pl-3 ${formErrors.lastName ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                    disabled={isPending}
                    required
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                    Phone Number <span className="text-slate-400">(Optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className={`pl-3 ${formErrors.phone ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                    disabled={isPending}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`pl-10 ${formErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
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
                      className={`pl-10 pr-10 ${formErrors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-red-600">{formErrors.password}</p>
                  )}
                  {formData.password && !formErrors.password && (
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>Password requirements:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li className={formData.password.length >= 8 ? "text-emerald-600" : "text-slate-400"}>
                          At least 8 characters
                        </li>
                        <li className={/[a-z]/.test(formData.password) ? "text-emerald-600" : "text-slate-400"}>
                          One lowercase letter
                        </li>
                        <li className={/[A-Z]/.test(formData.password) ? "text-emerald-600" : "text-slate-400"}>
                          One uppercase letter
                        </li>
                        <li className={/\d/.test(formData.password) ? "text-emerald-600" : "text-slate-400"}>
                          One number
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 ${formErrors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isPending}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}

            {/* Sign In Form */}
            {mode === "signin" && (
              <form onSubmit={handleLogin} className="space-y-4">

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`pl-10 ${formErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
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
                      className={`pl-10 pr-10 ${formErrors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`pl-10 ${formErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            {/* Demo Login Buttons - Only show on signin mode */}
            {mode === "signin" && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Demo Accounts</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin('admin')}
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                    disabled={isPending}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Login as Admin
                    <span className="ml-2 text-xs text-blue-500">(admin@ecommerce.com)</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin('customer')}
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                    disabled={isPending}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Login as Customer
                    <span className="ml-2 text-xs text-green-500">(customer1@example.com)</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="text-center space-y-2">
              {mode === "signin" && (
                <>
                  <Button
                    variant="link"
                    onClick={() => setMode("forgot")}
                    className="text-slate-600 hover:text-emerald-600"
                    disabled={isPending}
                  >
                    Forgot your password?
                  </Button>
                  <p className="text-sm text-slate-600">
                    Don't have an account?{" "}
                    <Button
                      variant="link"
                      onClick={() => setMode("signup")}
                      className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
                      disabled={isPending}
                    >
                      Sign up
                    </Button>
                  </p>
                </>
              )}

              {mode === "signup" && (
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    onClick={() => setMode("signin")}
                    className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
                    disabled={isPending}
                  >
                    Sign in
                  </Button>
                </p>
              )}

              {mode === "forgot" && (
                <p className="text-sm text-slate-600">
                  Remember your password?{" "}
                  <Button
                    variant="link"
                    onClick={() => setMode("signin")}
                    className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
                    disabled={isPending}
                  >
                    Sign in
                  </Button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
