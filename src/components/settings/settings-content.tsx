"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Building2, Mail, Phone, MapPin, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setGTMScript } from "@/lib/features/products/productsSlice";

export function SettingsContent() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // 👈 while fetching data

  const [formData, setFormData] = useState({
    companyName: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+1 (555) 123-4567",
    gtmScript: "",
    companyLogo: "",
    website: "https://acme.com",
    address: "123 Business Ave",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    description: "Leading provider of innovative business solutions.",
  });

  const dispatch = useDispatch();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.companyLogo.trim()) {
      newErrors.companyLogo = "Company logo is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setNotification(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/company-setting`,
        {
          method: "POST", // use "PUT" if updating
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: formData.companyName,
            logo: formData.companyLogo,
            description: formData.description,
            gtmScript: formData.gtmScript,
            contactInfo: {
              email: formData.email,
              phone: formData.phone,
              website: formData.website,
            },
            address: {
              street: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country,
            },
            additionalFields: [],
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setNotification("✅ Settings saved successfully!");
      } else {
        setNotification(`❌ Error: ${data.error || "Failed to save"}`);
      }
    } catch (err: any) {
      setNotification(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setInitialLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/company-setting/get-setting`
        );
        // 👆 replace "123" with actual settings ID,
        // or just "/api/v1/company-settings" if you return the single record

        const data = await response.json();

        console.log("data", data);
        if (data.success) {
          const settings = data.data;

          setFormData({
            companyName: settings.companyName || "",
            companyLogo: settings.logo || "",
            gtmScript: settings.gtmScript || "",
            email: settings.contactInfo?.email || "",
            phone: settings.contactInfo?.phone || "",
            website: settings.contactInfo?.website || "",
            address: settings.address?.street || "",
            city: settings.address?.city || "",
            state: settings.address?.state || "",
            zipCode: settings.address?.zipCode || "",
            country: settings.address?.country || "",
            description: settings.description || "",
          });
        } else {
          setNotification("⚠️ Could not load settings");
        }
      } catch (err: any) {
        setNotification(`❌ Error: ${err.message}`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        {notification && (
          <div className="p-3 rounded-md text-sm font-medium bg-slate-100 text-slate-800">
            {notification}
          </div>
        )}
      </div>

      {initialLoading ? (
        <p className="text-slate-500">Loading settings...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* your existing form stays unchanged */}
        </form>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Logo Section */}
        {/* <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Recommended: 200x200px, PNG or JPG format
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Company Information */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className={errors.companyName ? "border-red-500" : ""}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-600">{errors.companyName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Logo</Label>
                <Input
                  id="companyLogo"
                  value={formData.companyLogo}
                  onChange={(e) =>
                    handleInputChange("companyLogo", e.target.value)
                  }
                  className={errors.companyLogo ? "border-red-500" : ""}
                  placeholder="https://placeholder.com/logo.png"
                />
                {errors.companyName && (
                  <p className="text-xs text-red-600">{errors.companyLogo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="pl-10"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">GTM Script</Label>
              <Textarea
                id="gtmScript"
                value={formData.gtmScript}
                onChange={(e) => handleInputChange("gtmScript", e.target.value)}
                rows={3}
                placeholder="Add google tag manager script"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-xs text-red-600">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
