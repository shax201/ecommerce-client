import { NextRequest, NextResponse } from "next/server";
import {
  revalidateProducts,
  revalidateContent,
  revalidateCompanySettings,
  revalidateAll,
  handleProductUpdate,
  handleContentUpdate,
  handleSettingsUpdate,
  handleHeroSectionsUpdate,
  handleNavbarUpdate,
  handleNavigationUpdate,
  handleFooterUpdate,
  handleClientLogosUpdate,
  handleLogoUpdate,
} from "@/actions/revalidate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, secret } = body;

    // Basic authentication - in production, use proper authentication
    const expectedSecret = process.env.REVALIDATION_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let result;

    switch (type) {
      case "products":
        result = await revalidateProducts();
        break;

      case "content":
        result = await revalidateContent();
        break;

      case "settings":
        result = await revalidateCompanySettings();
        break;

      case "all":
        result = await revalidateAll();
        break;

      case "product-update":
        result = await handleProductUpdate(data?.productId);
        break;

      case "content-update":
        result = await handleContentUpdate(data?.contentType);
        break;

      case "settings-update":
        result = await handleSettingsUpdate();
        break;

      case "hero-sections-update":
        result = await handleHeroSectionsUpdate();
        break;

      case "navbar-update":
        result = await handleNavbarUpdate();
        break;

      case "navigation-update":
        result = await handleNavigationUpdate();
        break;

      case "footer-update":
        result = await handleFooterUpdate();
        break;

      case "client-logos-update":
        result = await handleClientLogosUpdate();
        break;

      case "logo-update":
        result = await handleLogoUpdate(data?.logoId);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid revalidation type",
            supportedTypes: [
              "products",
              "content",
              "settings",
              "all",
              "product-update",
              "content-update",
              "settings-update",
              "hero-sections-update",
              "navbar-update",
              "navigation-update",
              "footer-update",
              "client-logos-update",
              "logo-update",
            ],
          },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("Revalidation API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "ISR Revalidation API is running",
    endpoints: {
      POST: {
        description: "Trigger cache revalidation",
        body: {
          type: "products | content | settings | all | product-update | content-update | settings-update",
          data: "object (optional, for specific updates)",
          secret: "string (REVALIDATION_SECRET from env)",
        },
      },
    },
  });
}
