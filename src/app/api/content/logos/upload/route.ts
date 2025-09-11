import { NextRequest, NextResponse } from "next/server";

// POST /api/content/logos/upload - Upload logo file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only JPEG, PNG, SVG, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File size too large. Maximum size is 5MB.",
        },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Upload the file to a cloud storage service (AWS S3, Cloudinary, etc.)
    // 2. Generate a unique filename
    // 3. Store the file metadata in a database
    // 4. Return the public URL

    // For now, we'll simulate a successful upload
    const fileName = `logo-${Date.now()}-${file.name}`;
    const fileUrl = `/uploads/logos/${fileName}`;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
