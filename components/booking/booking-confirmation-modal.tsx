"use client"

import { useState } from "react"
import type { BookingMini } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, Loader2 } from "lucide-react"

interface BookingConfirmationModalProps {
  booking: BookingMini | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (booking: BookingMini) => Promise<void>
  isLoading?: boolean
}

export function BookingConfirmationModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: BookingConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!booking) return
    setIsSubmitting(true)
    try {
      await onConfirm(booking)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!booking) return null

  const bookingDate = new Date(booking.booking_date)
  const dateStr = bookingDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-green-500/20 text-green-700"
      case "CONFIRMED":
        return "bg-blue-500/20 text-blue-700"
      case "COMPLETED":
        return "bg-yellow-500/20 text-yellow-700"
      case "CANCELLED":
        return "bg-red-500/20 text-red-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">✅ Xác nhận đặt sân</DialogTitle>
          <DialogDescription>Kiểm tra thông tin trước khi xác nhận</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3 rounded-lg bg-card/50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <span className="text-lg">🏟️</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sân thể thao</p>
                <p className="font-semibold">Sân #{booking.sport_field}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày đặt</p>
                <p className="font-semibold">{dateStr}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Thời gian</p>
                <p className="font-semibold">{booking.rental_slot}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                <span className="text-lg">📋</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(booking.status)}`}
                >
                  {booking.status === "PENDING" && "Trống"}
                  {booking.status === "CONFIRMED" && "Đã đặt"}
                  {booking.status === "COMPLETED" && "Hoàn thành"}
                  {booking.status === "CANCELLED" && "Đã hủy"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1 bg-transparent">
              ❌ Hủy bỏ
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>✅ Xác nhận đặt</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
