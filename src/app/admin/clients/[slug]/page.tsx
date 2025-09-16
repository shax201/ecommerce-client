import { fetchClientById } from "../clients-data"
import { ClientDetails } from "./client-details"
import { notFound } from "next/navigation"

export default async function ClientPage(props: { params: Promise<{ slug:string }> }) {
  const params = await props.params;
  const clientId = params.slug;
  
  // Check if the slug is a valid MongoDB ObjectId (24 characters hexadecimal)
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(clientId);
  
  // If it's not a valid ObjectId, return not found
  if (!isValidObjectId) {
    return notFound();
  }
  
  const client = await fetchClientById(clientId);
  
  if (!client) {
    return notFound();
  }

  return <ClientDetails client={client} />;
}