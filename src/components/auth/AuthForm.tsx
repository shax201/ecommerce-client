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
} from "lucide-react";
import {
  useLoginMutation,
  useAdminLoginMutation,
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
  const [userType, setUserType] = useState<"admin" | "client">("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Redux hooks
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Redux mutations
  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const [adminLogin, { isLoading: isAdminLoginLoading, error: adminLoginError }] = useAdminLoginMutation();
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



  const isPending = isLoginLoading || isAdminLoginLoading || isSignupLoading || isForgotPasswordLoading;

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
      let result;

      if (userType === "admin") {
        // Clear client data before admin login
        if (typeof window !== 'undefined') {
          localStorage.removeItem("user-token");
          localStorage.removeItem("client");
          console.log("✅ [Admin Login] Cleared client tokens and data");
        }

        result = await adminLogin({
          email: formData.email,
          password: formData.password,
        }).unwrap();

        if (result.success) {
          dispatch(setUser(result.data.admin));
          setSuccessMessage("Admin login successful!");
          router.push("/admin");
        }
      } else {
        // Clear admin data before client login
        if (typeof window !== 'undefined') {
          localStorage.removeItem("admin-token");
          localStorage.removeItem("admin");
          console.log("✅ [Client Login] Cleared admin tokens and data");
        }

        result = await login({
          email: formData.email,
          password: formData.password,
        }).unwrap();

        if (result.success) {
          dispatch(setUser(result.data.client));
          setSuccessMessage("Client login successful!");
          router.push("/");
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
        dispatch(setUser(result.data.client));
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

  const getTitle = () => {
    switch (mode) {
      case "signup":
        return "Create Account";
      case "signin":
        return userType === "admin" ? "Admin Login" : "Welcome Back";
      case "forgot":
        return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signup":
        return "Sign up to get started with your account";
      case "signin":
        return userType === "admin" 
          ? "Sign in to your admin account to access the dashboard" 
          : "Sign in to your account to continue";
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
                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Login As
                  </Label>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={userType === "client" ? "default" : "outline"}
                      onClick={() => setUserType("client")}
                      className={`flex-1 ${
                        userType === "client" 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      disabled={isPending}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Client
                    </Button>
                    <Button
                      type="button"
                      variant={userType === "admin" ? "default" : "outline"}
                      onClick={() => setUserType("admin")}
                      className={`flex-1 ${
                        userType === "admin" 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      disabled={isPending}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </div>
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
                      {userType === "admin" ? "Signing in as Admin..." : "Signing In..."}
                    </>
                  ) : (
                    userType === "admin" ? "Sign In as Admin" : "Sign In"
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
