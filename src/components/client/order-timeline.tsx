"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, Package, CheckCircle } from "lucide-react"

interface TimelineEvent {
  id: string
  title: string
  description: string
  timestamp: string
  status: "completed" | "current" | "upcoming"
  icon?: React.ComponentType<{ className?: string }>
}

interface OrderTimelineProps {
  events: TimelineEvent[]
  className?: string
}

export function OrderTimeline({ events, className }: OrderTimelineProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Order Timeline
        </CardTitle>
        <CardDescription>Track your order progress in real-time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {events.map((event, index) => {
            const Icon = event.icon || Package
            const isLast = index === events.length - 1

            return (
              <div key={event.id} className="relative flex items-start space-x-4">
                {/* Timeline Line */}
                {!isLast && <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200" />}

                {/* Event Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 bg-white",
                    event.status === "completed" && "border-green-200 bg-green-50",
                    event.status === "current" && "border-blue-200 bg-blue-50",
                    event.status === "upcoming" && "border-gray-200 bg-gray-50",
                  )}
                >
                  {event.status === "completed" ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Icon
                      className={cn(
                        "w-6 h-6",
                        event.status === "current" && "text-blue-600",
                        event.status === "upcoming" && "text-gray-400",
                      )}
                    />
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn(
                        "text-sm font-medium",
                        event.status === "completed" && "text-green-900",
                        event.status === "current" && "text-blue-900",
                        event.status === "upcoming" && "text-gray-500",
                      )}
                    >
                      {event.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {event.status === "current" && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Current
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-sm mt-1",
                      event.status === "completed" && "text-green-700",
                      event.status === "current" && "text-blue-700",
                      event.status === "upcoming" && "text-gray-500",
                    )}
                  >
                    {event.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
