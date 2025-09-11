import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 250))

    const data = {
      addresses: [
        {
          id: "addr_1",
          type: "home",
          isDefault: true,
          firstName: "John",
          lastName: "Doe",
          company: "",
          addressLine1: "123 Main Street",
          addressLine2: "Apt 4B",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "United States",
          phone: "+1 (555) 123-4567",
          createdAt: "2023-01-15T10:00:00Z",
          updatedAt: "2023-06-20T14:30:00Z",
        },
        {
          id: "addr_2",
          type: "work",
          isDefault: false,
          firstName: "John",
          lastName: "Doe",
          company: "Tech Corp Inc.",
          addressLine1: "456 Business Ave",
          addressLine2: "Suite 200",
          city: "New York",
          state: "NY",
          postalCode: "10002",
          country: "United States",
          phone: "+1 (555) 987-6543",
          createdAt: "2023-03-10T09:15:00Z",
          updatedAt: "2023-03-10T09:15:00Z",
        },
      ],
      defaultAddressId: "addr_1",
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 350))

    // In a real app, you would validate and save the address to the database
    const newAddress = {
      id: `addr_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      data: newAddress,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real app, you would validate and update the address in the database
    const updatedAddress = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get("id")

    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // In a real app, you would delete the address from the database
    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
