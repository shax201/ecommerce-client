"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const defaultUserProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "/professional-headshot.png",
  dateOfBirth: "1990-05-15",
  bio: "Tech enthusiast and frequent online shopper. Love discovering new products and brands.",
  joinDate: "2023-01-15",
  accountStatus: "verified",
  preferences: {
    newsletter: true,
    promotions: true,
    orderUpdates: true,
  },
};

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  api?: string;
}

interface LocalStorageUserData {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: number | string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export function ProfileManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(defaultUserProfile);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfileFromLocalStorage = () => {
      try {
        const storedUserData =
          localStorage.getItem("client") ||
          localStorage.getItem("user") ||
          localStorage.getItem("profile");

        if (storedUserData) {
          const userData: LocalStorageUserData = JSON.parse(storedUserData);

          if (userData._id) {
            setUserId(userData._id);
          }

          const mappedProfile = {
            ...defaultUserProfile,
            firstName: userData.firstName || defaultUserProfile.firstName,
            lastName: userData.lastName || defaultUserProfile.lastName,
            email: userData.email || defaultUserProfile.email,
            phone: userData.phone
              ? String(userData.phone)
              : defaultUserProfile.phone,
            accountStatus: userData.status ? "verified" : "pending",
            joinDate: userData.createdAt
              ? userData.createdAt.split("T")[0]
              : defaultUserProfile.joinDate,
          };

          setProfile(mappedProfile);
          console.log("Profile loaded from localStorage:", mappedProfile);
        } else {
          console.log(
            "No user data found in localStorage, using default profile"
          );
        }
      } catch (error) {
        console.error("Error loading profile from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileFromLocalStorage();
  }, []);

  const updateProfileViaAPI = async (
    updatedProfile: typeof profile
  ): Promise<boolean> => {
    try {
      const apiPayload = {
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        phone: +updatedProfile.phone,
        bio: updatedProfile.bio,
        dateOfBirth: updatedProfile.dateOfBirth,
      };

      const response = await fetch(
        `http://localhost:5000/api/v1/clients/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const responseData = await response.json();
      console.log("Profile updated via API:", responseData);
      return true;
    } catch (error) {
      console.error("API update failed:", error);
      throw error;
    }
  };

  const saveProfileToLocalStorage = (updatedProfile: typeof profile) => {
    try {
      const storedUserData =
        localStorage.getItem("userData") ||
        localStorage.getItem("user") ||
        localStorage.getItem("profile");
      let userData: LocalStorageUserData = {};

      if (storedUserData) {
        userData = JSON.parse(storedUserData);
      }

      const updatedUserData = {
        ...userData,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        updatedAt: new Date().toISOString(),
      };

      const storageKey = localStorage.getItem("userData")
        ? "userData"
        : localStorage.getItem("user")
          ? "user"
          : "profile";
      localStorage.setItem(storageKey, JSON.stringify(updatedUserData));

      console.log("Profile saved to localStorage:", updatedUserData);
    } catch (error) {
      console.error("Error saving profile to localStorage:", error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 1 && name.trim().length <= 50;
  };

  const validateDateOfBirth = (date: string): boolean => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  };

  const validateBio = (bio: string): boolean => {
    return bio.length <= 500;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!validateName(profile.firstName)) {
      newErrors.firstName =
        "First name is required and must be less than 50 characters";
    }

    if (!validateName(profile.lastName)) {
      newErrors.lastName =
        "Last name is required and must be less than 50 characters";
    }

    if (!validateEmail(profile.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePhone(profile.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!validateDateOfBirth(profile.dateOfBirth)) {
      newErrors.dateOfBirth = "Please enter a valid date of birth (age 13-120)";
    }

    if (!validateBio(profile.bio)) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Image size must be less than 5MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      setProfile((prev) => ({ ...prev, avatar: result }));
      setErrors((prev) => ({ ...prev, avatar: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrors((prev) => ({ ...prev, api: undefined }));

    try {
      await updateProfileViaAPI(profile);
      saveProfileToLocalStorage(profile);

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully via API!");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("API update failed, saving to localStorage only:", error);

      try {
        saveProfileToLocalStorage(profile);
        setIsEditing(false);
        setSuccessMessage("Profile saved locally (API unavailable)");
        setErrors((prev) => ({
          ...prev,
          api: "API update failed, but changes were saved locally",
        }));

        setTimeout(() => {
          setSuccessMessage("");
          setErrors((prev) => ({ ...prev, api: undefined }));
        }, 5000);
      } catch (localError) {
        setErrors({ api: "Failed to save profile. Please try again." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCancel = () => {
    const storedUserData =
      localStorage.getItem("userData") ||
      localStorage.getItem("user") ||
      localStorage.getItem("profile");
    if (storedUserData) {
      try {
        const userData: LocalStorageUserData = JSON.parse(storedUserData);
        const mappedProfile = {
          ...defaultUserProfile,
          firstName: userData.firstName || defaultUserProfile.firstName,
          lastName: userData.lastName || defaultUserProfile.lastName,
          email: userData.email || defaultUserProfile.email,
          phone: userData.phone
            ? String(userData.phone)
            : defaultUserProfile.phone,
          accountStatus: userData.status ? "verified" : "pending",
          joinDate: userData.createdAt
            ? userData.createdAt.split("T")[0]
            : defaultUserProfile.joinDate,
        };
        setProfile(mappedProfile);
      } catch (error) {
        setProfile(defaultUserProfile);
      }
    } else {
      setProfile(defaultUserProfile);
    }

    setErrors({});
    setAvatarPreview(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errors.api && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.api}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Profile data loaded from localStorage. Changes will be saved to API
          and localStorage.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Edit Profile"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={avatarPreview || profile.avatar}
                  alt={fullName}
                />
                <AvatarFallback className="text-lg">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{fullName}</h3>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {profile.accountStatus}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(profile.joinDate).toLocaleDateString()}
              </p>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Click the camera icon to upload a new profile picture (max
                  5MB)
                </p>
              )}
            </div>
          </div>

          {/* {errors.avatar && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.avatar}</AlertDescription>
            </Alert>
          )} */}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                  placeholder="Enter your first name"
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                  placeholder="Enter your last name"
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.lastName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profile.phone}
                  type="number"
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`pl-10 ${errors.dateOfBirth ? "border-red-500" : ""}`}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={!isEditing}
              rows={3}
              className={errors.bio ? "border-red-500" : ""}
              placeholder="Tell us a bit about yourself..."
            />
            <div className="flex justify-between items-center">
              {errors.bio && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.bio}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {profile.bio.length}/500 characters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Account Age</p>
                <p className="text-2xl font-bold">
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(profile.joinDate).getTime()) /
                      (1000 * 60 * 60 * 24 * 365)
                  )}{" "}
                  years
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Email Status</p>
                <p className="text-2xl font-bold text-green-600">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Phone Status</p>
                <p className="text-2xl font-bold text-purple-600">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
