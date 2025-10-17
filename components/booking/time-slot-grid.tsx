"use client"

import type { BookingMini } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Lock } from "lucide-react"

interface TimeSlotGridProps {
  bookings: BookingMini[]
  selectedSlotId?: number
  onSlotSelect: (booking: BookingMini) => void
  currentUserId?: number
  isLoading?: boolean
  fieldPrice?: number
}

export function TimeSlotGrid({
  bookings,
  selectedSlotId,
  onSlotSelect,
  currentUserId,
  isLoading = false,
  fieldPrice = 0,
}: TimeSlotGridProps) {

  const getSlotStatus = (booking: BookingMini) => {
    if (booking.status === "PENDING") return "available"
    if (booking.status === "CONFIRMED") return "booked-other"
    if (booking.status === "COMPLETED") return "completed"
    if (booking.status === "CANCELLED") return "cancelled"
    return "available"
  }

  const getSlotColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-accent/10 border-accent hover:bg-accent/20 cursor-pointer"
      case "booked-other":
        return "bg-muted/20 border-muted cursor-not-allowed opacity-60"
      case "completed":
        return "bg-yellow-500/10 border-yellow-500 cursor-not-allowed opacity-60"
      case "cancelled":
        return "bg-destructive/10 border-destructive cursor-not-allowed opacity-60"
      default:
        return "bg-muted/10 border-muted"
    }
  }

  const getSlotLabel = (status: string) => {
    switch (status) {
      case "available":
        return "✅ Trống"
      case "booked-other":
        return "❌ Đã đặt"
      case "completed":
        return "🟡 Hoàn thành"
      case "cancelled":
        return "🔴 Đã hủy"
      default:
        return "?"
    }
  }

  const groupByPeriod = (bookings: BookingMini[]) => {
    const periods: { [key: string]: BookingMini[] } = {
      "🌅 SÁNG (6h-12h)": [],
      "☀️ CHIỀU (12h-18h)": [],
      "🌙 TỐI (18h-22h)": [],
    }

    bookings.forEach((booking) => {
      const time = booking.rental_slot.split(" - ")[0]
      const hour = Number.parseInt(time.split(":")[0])

      if (hour >= 6 && hour < 12) {
        periods["🌅 SÁNG (6h-12h)"].push(booking)
      } else if (hour >= 12 && hour < 18) {
        periods["☀️ CHIỀU (12h-18h)"].push(booking)
      } else if (hour >= 18 && hour <= 22) {
        periods["🌙 TỐI (18h-22h)"].push(booking)
      }
    })

    return periods
  }

  const periods = groupByPeriod(bookings)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(periods).map(([period, slots]) => (
        <div key={period}>
          <h4 className="mb-3 font-semibold text-muted-foreground">{period}</h4>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {slots.map((booking) => {
              const status = getSlotStatus(booking)
              const isClickable = status === "available"
              const isSelected = selectedSlotId === booking.id

              return (
                <button
                  key={booking.id}
                  onClick={() => isClickable && onSlotSelect(booking)}
                  disabled={!isClickable}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all",
                    getSlotColor(status),
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  )}
                >
                  <span className="text-sm font-bold">{booking.rental_slot}</span>
                  <span className="text-xs">{getSlotLabel(status)}</span>
                  <span className="text-sm font-semibold text-primary">{fieldPrice.toLocaleString()}đ</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted py-8">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="text-center text-muted-foreground">Không có slot nào cho ngày này</p>
        </div>
      )}
    </div>
  )
}
