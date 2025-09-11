"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  signUpAction,
  signInAction,
  forgotPasswordAction,
  socialLoginAction,
  type AuthState,
} from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // useActionState for different forms
  const [signUpState, signUpFormAction, isSignUpPending] = useActionState(
    signUpAction,
    {} as AuthState
  );
  const [signInState, signInFormAction, isSignInPending] = useActionState(
    signInAction,
    {} as AuthState
  );
  const [
    forgotPasswordState,
    forgotPasswordFormAction,
    isForgotPasswordPending,
  ] = useActionState(forgotPasswordAction, {} as AuthState);

  const currentState =
    mode === "signup"
      ? signUpState
      : mode === "signin"
        ? signInState
        : forgotPasswordState;
  const isPending =
    isSignUpPending || isSignInPending || isForgotPasswordPending;

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

  useEffect(() => {
    // Redirect after mount
    if (currentState.success) {
      console.log("currentState at 91", currentState);
      if (currentState.data) {
        localStorage.setItem("client", currentState.data);
      }
      router.push("/");
    }
  }, [currentState]);

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
            {/* Success/Error Messages */}
            {currentState.success && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  {currentState.message}
                </AlertDescription>
              </Alert>
            )}

            {!currentState.success && currentState.message && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  {currentState.message}
                </AlertDescription>
              </Alert>
            )}

            {currentState.errors?.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {currentState.errors.general}
                </AlertDescription>
              </Alert>
            )}

            {/* Sign Up Form */}
            {mode === "signup" && (
              <form action={signUpFormAction} className="space-y-4">
                {/* First Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-firstname"
                    className="text-sm font-medium text-slate-700"
                  >
                    First Name
                  </Label>
                  <Input
                    id="signup-firstname"
                    name="firstname"
                    type="text"
                    placeholder="Enter your first name"
                    className={`pl-3 ${signUpState.errors?.firstname ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                    disabled={isPending}
                    required
                  />
                  {signUpState.errors?.firstname && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {signUpState.errors.firstname}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Last Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-lastname"
                    className="text-sm font-medium text-slate-700"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="signup-lastname"
                    name="lastname"
                    type="text"
                    placeholder="Enter your last name"
                    className={`pl-3 ${signUpState.errors?.lastname ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                    disabled={isPending}
                    required
                  />
                  {signUpState.errors?.lastname && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {signUpState.errors.lastname}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-phone"
                    className="text-sm font-medium text-slate-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`pl-3 ${signUpState.errors?.phone ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                    disabled={isPending}
                    required
                  />
                  {signUpState.errors?.phone && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {signUpState.errors.phone}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 ${signUpState.errors?.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      aria-describedby={
                        signUpState.errors?.email
                          ? "signup-email-error"
                          : undefined
                      }
                      required
                    />
                  </div>
                  {signUpState.errors?.email && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription
                        id="signup-email-error"
                        className="text-sm"
                      >
                        {signUpState.errors.email}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={`pl-10 pr-10 ${signUpState.errors?.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      aria-describedby={
                        signUpState.errors?.password
                          ? "signup-password-error"
                          : undefined
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  {signUpState.errors?.password && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription
                        id="signup-password-error"
                        className="text-sm"
                      >
                        {signUpState.errors.password}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-confirm-password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 ${signUpState.errors?.confirmPassword ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      aria-describedby={
                        signUpState.errors?.confirmPassword
                          ? "signup-confirm-password-error"
                          : undefined
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isPending}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  {signUpState.errors?.confirmPassword && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription
                        id="signup-confirm-password-error"
                        className="text-sm"
                      >
                        {signUpState.errors.confirmPassword}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 transition-colors"
                  disabled={isPending}
                >
                  {isSignUpPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}

            {/* Sign In Form */}
            {mode === "signin" && (
              <form action={signInFormAction} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 ${signInState.errors?.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      aria-describedby={
                        signInState.errors?.email
                          ? "signin-email-error"
                          : undefined
                      }
                      required
                    />
                  </div>
                  {signInState.errors?.email && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription
                        id="signin-email-error"
                        className="text-sm"
                      >
                        {signInState.errors.email}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`pl-10 pr-10 ${signInState.errors?.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      aria-describedby={
                        signInState.errors?.password
                          ? "signin-password-error"
                          : undefined
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  {signInState.errors?.password && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription
                        id="signin-password-error"
                        className="text-sm"
                      >
                        {signInState.errors.password}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-emerald-600 hover:text-emerald-700 p-0 h-auto font-normal"
                    onClick={() => setMode("forgot")}
                    disabled={isPending}
                  >
                    Forgot your password?
                  </Button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 transition-colors"
                  disabled={isPending}
                >
                  {isSignInPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === "forgot" && (
              <form action={forgotPasswordFormAction} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="forgot-email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="forgot-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 ${forgotPasswordState.errors?.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"}`}
                      disabled={isPending}
                      aria-describedby={
                        forgotPasswordState.errors?.email
                          ? "forgot-email-error"
                          : undefined
                      }
                      required
                    />
                  </div>
                  {forgotPasswordState.errors?.email && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription
                        id="forgot-email-error"
                        className="text-sm"
                      >
                        {forgotPasswordState.errors.email}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 transition-colors"
                  disabled={isPending}
                >
                  {isForgotPasswordPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Sending Reset Link...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                {/* Back to Sign In */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-emerald-600 hover:text-emerald-700 p-0 h-auto font-normal"
                    onClick={() => setMode("signin")}
                    disabled={isPending}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            {mode !== "forgot" && (
              <>
                <Separator />
                <div className="text-center text-sm text-slate-600">
                  {mode === "signup"
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="text-emerald-600 hover:text-emerald-700 p-0 h-auto font-medium"
                    onClick={() =>
                      setMode(mode === "signup" ? "signin" : "signup")
                    }
                    disabled={isPending}
                  >
                    {mode === "signup" ? "Sign In" : "Sign Up"}
                  </Button>
                </div>
              </>
            )}
          </CardFooter>
        </Card>

        {/* Terms and Privacy (Sign Up Only) */}
        {mode === "signup" && (
          <div className="mt-6 text-center text-xs text-slate-500 px-4">
            By creating an account, you agree to our{" "}
            <Button
              variant="link"
              className="text-xs p-0 h-auto text-emerald-600 hover:text-emerald-700"
            >
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button
              variant="link"
              className="text-xs p-0 h-auto text-emerald-600 hover:text-emerald-700"
            >
              Privacy Policy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
