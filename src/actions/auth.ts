"use server";

import { setCookie } from "@/lib/setCookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// This is a simplified example. In a real application, you would:
// 1. Hash passwords before storing them (e.g., using bcrypt).
// 2. Verify hashed passwords securely.
// 3. Interact with a database or an authentication service.
// 4. Implement proper session management (e.g., using cookies or JWTs).

const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
}

export async function login(
  prevState: { success: boolean; message: string },
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  
  console.log('getBackendUrl', getBackendUrl())
  try {
    const response = await fetch(
      `${getBackendUrl()}/api/v1/clients/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    console.log("response", response);
    const data = await response.json();

    console.log("data at 36", data);
    if (data.success) {
      // console.log("data",data);
      return {
        success: true,
        message: "Login successful!",
        role: data.data.user.role,
      };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: "Invalid email or password." };
  }
}

export interface AuthState {
  success?: boolean;
  message?: string;
  errors?: {
    firstname?: string;
    lastname?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
  data?: any;
}

// Simulate user database
const users = new Map<string, { email: string; password: string }>();

export async function signUpAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const firstname = formData.get("firstname") as string;
  const lastname = formData.get("lastname") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Server-side validation
  const errors: AuthState["errors"] = {};

  // Firstname validation
  if (!firstname) {
    errors.firstname = "First name is required";
  } else if (firstname.trim().length < 2) {
    errors.firstname = "First name must be at least 2 characters long";
  }

  // Lastname validation
  if (!lastname) {
    errors.lastname = "Last name is required";
  } else if (lastname.trim().length < 2) {
    errors.lastname = "Last name must be at least 2 characters long";
  }

  // Phone validation
  if (!phone) {
    errors.phone = "Phone number is required";
  } else if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    errors.phone = "Enter a valid phone number";
  }

  // Email validation
  if (!email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Please enter a valid email address";
  } else if (users.has(email)) {
    errors.email = "An account with this email already exists";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password =
      "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }

  // Confirm password validation
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // If any errors, return them
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const payload = {
      firstName: firstname,
      lastName: lastname,
      phone: +phone,
      email,
      password,
    };

    console.log("payload", payload);
    const response = await fetch(`${getBackendUrl()}/clients/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    console.log("data in 155", data);
    if (data.success) {
      async function handleSetCookie() {
        "use server";
        await setCookie("user-token", data.data.token, 7200);
      }

      await handleSetCookie();
      return {
        success: true,
        message: "Sign up successful!",
      };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.log("error at signUpAction", error);
    return { success: false, message: "Invalid email or password." };
  }
}

export async function signInAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Server-side validation
  const errors: AuthState["errors"] = {};

  if (!email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

 
  // Check credentials
  try {
    const response = await fetch(`${getBackendUrl()}/clients/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (data.success) {
      async function setCookie(name: string, value: string, maxAge: number) {
        (await cookies()).set({
          name,
          value,
          maxAge,
          path: "/",
          httpOnly: false, // allow JS access
          secure: process.env.NODE_ENV === "production",
        });
      }

      await setCookie("user-token", data.data.token, 7200); // 7200s = 2 hours

      return {
        success: true,
        message: "Login successful!",
        data: JSON.stringify(data.data.client),
      };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.log("error at 176", error);
    return { success: false, message: "Invalid email or password." };
  }
}

export async function forgotPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const email = formData.get("email") as string;

  if (!email) {
    return {
      errors: {
        email: "Email is required",
      },
    };
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return {
      errors: {
        email: "Please enter a valid email address",
      },
    };
  }

  // In a real app, you would send a password reset email here
  return {
    success: true,
    message:
      "If an account with this email exists, you will receive a password reset link shortly.",
  };
}

export async function socialLoginAction(provider: "google" | "facebook") {
  // In a real app, you would redirect to the OAuth provider
  console.log(`Initiating ${provider} OAuth flow`);

  // Simulate OAuth redirect
  // redirect(`/auth/${provider}`)
}
