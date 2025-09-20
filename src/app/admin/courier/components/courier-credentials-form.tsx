"use client";

import { useState, useEffect } from "react";
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
import { CourierCredentialsFormData, CourierType } from "@/types/courier.types";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/store";
import {
  setCredentialsFormOpen,
  setCredentialsEditMode,
  setEditingCredentialsId,
  clearCredentialsForm,
} from "@/lib/features/courier";
import {
  useCreateCourierCredentialsMutation,
  useUpdateCourierCredentialsMutation,
} from "@/lib/features/courier/courierApi";
import { useToast } from "@/hooks/use-toast";

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

export default function CourierCredentialsForm() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const {
    ui: { isCredentialsEditMode, editingCredentialsId },
    forms: { credentialsForm },
  } = useAppSelector((state: RootState) => state.courier);

  const [createCredentials, { isLoading: isCreating }] = useCreateCourierCredentialsMutation();
  const [updateCredentials, { isLoading: isUpdating }] = useUpdateCourierCredentialsMutation();

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

  // Load form data when editing
  useEffect(() => {
    if (isCredentialsEditMode && credentialsForm) {
      form.reset(credentialsForm);
    } else {
      form.reset({
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
      });
    }
  }, [isCredentialsEditMode, credentialsForm]);

  const onSubmit = async (data: CredentialsFormValues) => {
    try {
      let result;
      if (isCredentialsEditMode && editingCredentialsId) {
        result = await updateCredentials({
          courier: editingCredentialsId as CourierType,
          data: data,
        }).unwrap();
      } else {
        result = await createCredentials(data).unwrap();
      }

      if (result.success) {
        toast({
          title: isCredentialsEditMode ? "Credentials Updated" : "Credentials Created",
          description: result.message || `${data.courier} credentials ${isCredentialsEditMode ? 'updated' : 'created'} successfully`,
          variant: "success",
        });

        // Close form and reset state
        dispatch(setCredentialsFormOpen(false));
        dispatch(setCredentialsEditMode(false));
        dispatch(setEditingCredentialsId(null));
        dispatch(clearCredentialsForm());
        form.reset();
      }
    } catch (error: any) {
      console.error('Failed to save credentials:', error);
      toast({
        title: "Error",
        description: error?.data?.message || `Failed to ${isCredentialsEditMode ? 'update' : 'create'} credentials`,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    dispatch(setCredentialsFormOpen(false));
    dispatch(setCredentialsEditMode(false));
    dispatch(setEditingCredentialsId(null));
    dispatch(clearCredentialsForm());
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isCredentialsEditMode ? 'Edit Courier Credentials' : 'Add New Courier Credentials'}
        </CardTitle>
        <CardDescription>
          Configure API credentials for courier services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Courier Selection */}
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

            {/* API Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Credentials</CardTitle>
                <CardDescription>
                  Enter your {selectedCourier} API credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCourier === 'pathao' ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status */}
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

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? 'Saving...'
                  : isCredentialsEditMode
                  ? 'Update Credentials'
                  : 'Create Credentials'
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
