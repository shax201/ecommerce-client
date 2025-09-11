import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const data = {
      user: {
        id: "user_123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        dateOfBirth: "1990-05-15",
        avatar: "/diverse-user-avatars.png",
        joinDate: "2023-01-15",
        preferences: {
          newsletter: true,
          smsNotifications: false,
          emailNotifications: true,
          language: "en",
          currency: "USD",
          timezone: "America/New_York",
        },
        stats: {
          totalOrders: 24,
          totalSpent: 2847.5,
          loyaltyPoints: 1250,
          membershipTier: "Gold",
          accountAge: "1 year 2 months",
        },
      },
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    // In a real app, you would validate and update the user profile in the database
    const updatedProfile = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
