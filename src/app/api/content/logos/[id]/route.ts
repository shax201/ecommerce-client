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

// GET /api/content/logos/[id] - Get single logo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logo = logos.find((l) => l.id === id);

    if (!logo) {
      return NextResponse.json(
        {
          success: false,
          error: "Logo not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: logo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch logo",
      },
      { status: 500 }
    );
  }
}

// PUT /api/content/logos/[id] - Update logo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, url, altText, type, isActive } = body;

    const logoIndex = logos.findIndex((l) => l.id === id);

    if (logoIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Logo not found",
        },
        { status: 404 }
      );
    }

    // Update logo
    logos[logoIndex] = {
      ...logos[logoIndex],
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(url !== undefined && { url }),
      ...(altText !== undefined && { altText }),
      ...(type !== undefined && { type }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: logos[logoIndex],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update logo",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/content/logos/[id] - Delete logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logoIndex = logos.findIndex((l) => l.id === id);

    if (logoIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Logo not found",
        },
        { status: 404 }
      );
    }

    const deletedLogo = logos[logoIndex];
    logos.splice(logoIndex, 1);

    return NextResponse.json({
      success: true,
      data: deletedLogo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete logo",
      },
      { status: 500 }
    );
  }
}
