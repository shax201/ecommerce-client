"use server"

export interface SizePayload {
  size?: string;
  sizes?: string[];
}

export interface SizeData {
  size: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SizeResponse {
  success: boolean;
  message: string;
  data?: SizeData[];
}

export async function getSizes(): Promise<SizeResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/attributes/sizes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || "Sizes fetched successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to fetch sizes.",
      };
    }
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return {
      success: false,
      message: "An error occurred while fetching sizes.",
    };
  }
}

export async function createSize(payload: SizePayload): Promise<SizeResponse> {
  // Validate input
  if (!payload.size && (!payload.sizes || payload.sizes.length === 0)) {
    return { success: false, message: "At least one size is required." };
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/attributes/sizes/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || "Size(s) created successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create size(s).",
      };
    }
  } catch (error) {
    console.error("Error creating size(s):", error);
    return {
      success: false,
      message: "An error occurred while creating size(s).",
    };
  }
}