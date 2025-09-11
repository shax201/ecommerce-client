"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ClientNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Client Not Found</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">
            The client you are looking for could not be found. This may be because:
          </p>
          <ul className="list-disc text-left pl-6 mb-4 text-gray-600">
            <li>The client ID is invalid or does not exist</li>
            <li>The client has been deleted</li>
            <li>You do not have permission to view this client</li>
          </ul>
          <p className="text-gray-700">
            Please check the client ID and try again or return to the clients list.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/clients">
            <Button variant="default">
              Return to Clients
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}