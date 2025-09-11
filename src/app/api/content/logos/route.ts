import { NextRequest, NextResponse } from "next/server";

// Mock database - in a real app, this would be a database
let logos = [
  {
    id: "1",
    name: "Main Logo",
    description: "Primary logo displayed in header",
    url: "/images/logo.png",
    altText: "ShopperV2 Logo",
    type: "main",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Footer Logo",
    description: "Logo displayed in footer",
    url: "/images/logo-footer.png",
    altText: "ShopperV2 Footer Logo",
    type: "footer",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Favicon",
    description: "Browser tab icon",
    url: "/favicon.ico",
    altText: "ShopperV2 Favicon",
    type: "favicon",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/content/logos - Get all logos
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: logos,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch logos",
      },
      { status: 500 }
    );
  }
}

// POST /api/content/logos - Create new logo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, url, altText, type, isActive = true } = body;

    // Validation
    if (!name || !altText || !type) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, altText, and type are required",
        },
        { status: 400 }
      );
    }

    const newLogo = {
      id: Date.now().toString(),
      name,
      description: description || "",
      url: url || "",
      altText,
      type,
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logos.push(newLogo);

    return NextResponse.json({
      success: true,
      data: newLogo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create logo",
      },
      { status: 500 }
    );
  }
}
