"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourierType } from "@/types/courier.types";
import { useCreateCourierCredentialsMutation } from "@/lib/features/courier/courierApi";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

// Form validation schema
const credentialsFormSchema = z.object({
  courier: z.enum(['pathao', 'steadfast'], {
    message: "Please select a courier service",
  }),
  credentials: z.object({
    // Pathao credentials
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    expires_in: z.number().optional(),
    base_url: z.string().optional(),
    
    // Steadfast credentials
    api_key: z.string().optional(),
    secret_key: z.string().optional(),
  }),
  isActive: z.boolean().optional(),
});

type CredentialsFormValues = z.infer<typeof credentialsFormSchema>;

export default function CreateCourierCredentialsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createCredentials, { isLoading: isCreating }] = useCreateCourierCredentialsMutation();
  
  // Form step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsFormSchema),
    defaultValues: {
      courier: 'pathao',
      credentials: {
        client_id: '',
        client_secret: '',
        username: '',
        password: '',
        access_token: '',
        refresh_token: '',
        expires_in: 0,
        base_url: '',
        api_key: '',
        secret_key: '',
      },
      isActive: true,
    },
  });

  const selectedCourier = form.watch('courier');

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return form.getValues('courier');
      case 2:
        const courier = form.getValues('courier');
        if (courier === 'pathao') {
          return form.getValues('credentials.client_id') && form.getValues('credentials.client_secret');
        } else {
          return form.getValues('credentials.api_key') && form.getValues('credentials.secret_key');
        }
      case 3:
        return true; // Status step is always valid
      default:
        return false;
    }
  };

  const onSubmit = async (data: CredentialsFormValues) => {
    try {
      const result = await createCredentials(data).unwrap();
      
      if (result.success) {
        toast({
          title: "Credentials Created",
          description: result.message || `${data.courier} credentials created successfully`,
          variant: "success",
        });
        
        // Redirect back to credentials management
        router.push('/admin/courier');
      }
    } catch (error: any) {
      console.error('Failed to create credentials:', error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create credentials",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push('/admin/courier');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Select Courier Service</h3>
              <p className="text-sm text-muted-foreground">
                Choose the courier service you want to configure
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="courier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Courier Service</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a courier service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pathao">Pathao</SelectItem>
                      <SelectItem value="steadfast">Steadfast</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the courier service you want to configure
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">API Credentials</h3>
              <p className="text-sm text-muted-foreground">
                Enter your {selectedCourier} API credentials
              </p>
            </div>

            {selectedCourier === 'pathao' ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="credentials.client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your client ID"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Pathao client ID
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credentials.client_secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your client secret"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Pathao client secret
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credentials.username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Pathao username
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credentials.password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Pathao password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credentials.base_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter base URL"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Pathao API base URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="credentials.api_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your API key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Steadfast API key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credentials.secret_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your secret key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Steadfast secret key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credentials.base_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter base URL"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Steadfast API base URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Status & Review</h3>
              <p className="text-sm text-muted-foreground">
                Review your settings and activate the credentials
              </p>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable these credentials
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Review Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Courier:</span>
                  <span className="text-sm font-medium capitalize">{selectedCourier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm font-medium">
                    {form.getValues('isActive') ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Base URL:</span>
                  <span className="text-sm font-medium">
                    {form.getValues('credentials.base_url') || 'Not set'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Courier Credentials</h1>
          <p className="text-muted-foreground">
            Set up API credentials for courier services
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStepValid(currentStep)}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isCreating || !isStepValid(currentStep)}
                      className="flex items-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Credentials'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
