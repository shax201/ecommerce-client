import { ClientData } from "./client.interface"

export async function fetchClients(): Promise<ClientData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    if (response.ok && data.success) {
      return data.data
    } else {
      console.error("Failed to fetch clients:", data.message)
      return []
    }
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function fetchClientById(clientId: string): Promise<ClientData | null> {
  // Validate clientId format (MongoDB ObjectId should be 24 characters hexadecimal)
  if (!clientId || typeof clientId !== 'string' || clientId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(clientId)) {
    console.error("Invalid client ID format:", clientId);
    return null;
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clients/${clientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    
    if (response.ok && data.success) {
      return data.data
    } else {
      console.error("Failed to fetch client:", data.message)
      return null
    }
  } catch (error) {
    console.error(`Error fetching client ${clientId}:`, error)
    return null
  }
}

export async function deleteClient(clientId: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clients/${clientId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return true
    } else {
      console.error("Failed to delete client:", data.message)
      return false
    }
  } catch (error) {
    console.error(`Error deleting client ${clientId}:`, error)
    return false
  }
}

export async function updateClient(clientId: string, updateData: any): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clients/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData)
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return { success: true, data: data.data }
    } else {
      console.error("Failed to update client:", data.message)
      return { success: false, message: data.message }
    }
  } catch (error) {
    console.error(`Error updating client ${clientId}:`, error)
    return { success: false, message: "An error occurred while updating the client" }
  }
} 