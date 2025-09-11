"use server"

export interface ColorPayload {
  color?: string;
  colors?: string[];
}

export interface ColorData {
  color: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ColorResponse {
  success: boolean;
  message: string;
  data?: ColorData[];
}

export async function getColors(): Promise<ColorResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/attributes/colors`, {
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
        message: data.message || "Colors fetched successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to fetch colors.",
      };
    }
  } catch (error) {
    console.error("Error fetching colors:", error);
    return {
      success: false,
      message: "An error occurred while fetching colors.",
    };
  }
}

export async function createColor(payload: ColorPayload): Promise<ColorResponse> {
  // Validate input
  if (!payload.color && (!payload.colors || payload.colors.length === 0)) {
    return { success: false, message: "At least one color is required." };
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/attributes/colors/create`, {
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
        message: data.message || "Color(s) created successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create color(s).",
      };
    }
  } catch (error) {
    console.error("Error creating color(s):", error);
    return {
      success: false,
      message: "An error occurred while creating color(s).",
    };
  }
}
