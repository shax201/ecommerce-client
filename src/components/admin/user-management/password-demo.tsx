"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PasswordDemo() {
  const [password, setPassword] = useState("");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Password Input Demo</CardTitle>
        <CardDescription>
          Click the eye icon to toggle password visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="demo-password">Password</Label>
          <PasswordInput
            id="demo-password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Current password: {password || "None"}</p>
          <p>Length: {password.length} characters</p>
        </div>
      </CardContent>
    </Card>
  );
}
