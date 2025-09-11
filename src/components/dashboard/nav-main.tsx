"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    submenu?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  
  // Track which menu items are expanded - initialize with Attributes expanded
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({
    "Attributes": true // Attributes menu is expanded by default
  })

  // Auto-expand menu if current path matches a submenu item
  React.useEffect(() => {
    items.forEach(item => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(subItem => 
          pathname.startsWith(subItem.url)
        )
        
        if (hasActiveSubmenu) {
          setExpandedItems((prev: Record<string, boolean>) => ({
            ...prev,
            [item.title]: true
          }))
        }
      }
    })
  }, [pathname, items])

  // Toggle submenu visibility
  const toggleSubmenu = (title: string) => {
    setExpandedItems((prev: Record<string, boolean>) => ({
      ...prev,
      [title]: !prev[title]
    }))
  }
  
  // Check if an item is active based on the current path
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + '/')

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Admin</h1>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.submenu && item.submenu.length > 0 ? (
                <>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    onClick={() => toggleSubmenu(item.title)}
                    isActive={isActive(item.url)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <span className="ml-auto">
                      {expandedItems[item.title] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </span>
                  </SidebarMenuButton>
                  
                  {expandedItems[item.title] && (
                    <SidebarMenuSub>
                      {item.submenu.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isActive(subItem.url)}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </>
              ) : (
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title} 
                  isActive={isActive(item.url)}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
              
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
