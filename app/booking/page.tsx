"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateSelector } from "@/components/booking/date-selector"
import { TimeSlotGrid } from "@/components/booking/time-slot-grid"
import { BookingConfirmationModal } from "@/components/booking/booking-confirmation-modal"
import { useToast } from "@/hooks/use-toast"
import { getBookings, updateBooking, type Booking } from "@/lib/booking-api"
import { getSportFields } from "@/lib/api"
import { MapPin, DollarSign, Star } from "lucide-react"

interface SportField {
  id: number
  name: string
  sport_type: string
  address: string
  price: number
  rating?: number
  images?: Array<{ image?: string; preview?: string }>
}

export default function BookingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<"field" | "date" | "time">("field")
  const [selectedField, setSelectedField] = useState<SportField | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [confirmingBooking, setConfirmingBooking] = useState<Booking | null>(null)

  const [fields, setFields] = useState<SportField[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingFields, setLoadingFields] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const currentUserId = typeof window !== "undefined" ? Number.parseInt(localStorage.getItem("user_id") || "0") : 0

  const getOptimizedImageUrl = (image: { preview?: string; file: string }) => {
    // Use preview image if available for better performance
    const imagePath = image.preview || image.file
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${imagePath}`
  }

  const getFullImageUrl = (image: { preview?: string; file: string }) => {
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${image.file}`
  }

  // Fetch sport fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoadingFields(true)
        const response = await getSportFields({ status: "ACTIVE" })
        setFields(response.results || [])
      } catch (error) {
        console.error("Failed to fetch fields:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách sân",
          variant: "destructive",
        })
      } finally {
        setLoadingFields(false)
      }
    }

    fetchFields()
  }, [toast])

  // Fetch bookings when field and date change
  useEffect(() => {
    if (!selectedField) return

    const fetchBookings = async () => {
      try {
        setLoadingBookings(true)
        const response = await getBookings({
          sport_field: selectedField.id,
          booking_date_: selectedDate.toISOString().split("T")[0],
          ordering: "rental_slot",
        })
        setBookings(response.results || response || [])
      } catch (error) {
        console.error("[v0] Failed to fetch bookings:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách slot",
          variant: "destructive",
        })
      } finally {
        setLoadingBookings(false)
      }
    }

    fetchBookings()
  }, [selectedField, selectedDate, toast])

  const handleFieldSelect = (field: SportField) => {
    setSelectedField(field)
    setSelectedDate(new Date())
    setStep("date")
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setStep("time")
  }

  const handleSlotSelect = (booking: Booking) => {
    setSelectedBooking(booking)
    setConfirmingBooking(booking)
  }

  const handleConfirmBooking = async (booking: Booking) => {
    try {
      setSubmitting(true)
      const newStatus = booking.status === "PENDING" ? "CONFIRMED" : "PENDING"
      await updateBooking(booking.id, { status: newStatus as "PENDING" | "CONFIRMED" })

      toast({
        title: "Thành công",
        description: newStatus === "CONFIRMED" ? "🎉 Bạn đã đặt sân thành công!" : "✅ Bạn đã hủy đặt sân",
      })

      // Refresh bookings
      const response = await getBookings({
        sport_field: selectedField!.id,
        booking_date_: selectedDate.toISOString().split("T")[0],
        ordering: "rental_slot",
      })
      setBookings(response.results || [])
      setSelectedBooking(null)
    } catch (error) {
      console.error("Failed to update booking:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật đặt sân",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">📅 Đặt sân thể thao</h1>
            <p className="mt-2 text-muted-foreground">Chọn sân, ngày, giờ và xác nhận đặt sân của bạn</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                  step === "field" || step === "date" || step === "time"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Chọn sân</span>
              <div className="flex-1 border-t-2 border-muted" />
            </div>

            <div className="flex flex-1 items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                  step === "date" || step === "time" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Chọn ngày</span>
              <div className="flex-1 border-t-2 border-muted" />
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                  step === "time" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="text-sm font-medium">Chọn giờ</span>
            </div>
          </div>

          {/* Step 1: Field Selection */}
          {step === "field" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-2xl font-bold">🏟️ Chọn sân thể thao</h2>
                {loadingFields ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {fields.map((field) => (
                      <Card
                        key={field.id}
                        className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg"
                        onClick={() => handleFieldSelect(field)}
                      >
                        <div className="relative h-40 overflow-hidden rounded-t-lg bg-muted">
                          {field.images && field.images.length > 0 ? (
                            <img
                              // src={field.images[0].preview || field.images[0].image}
                              // src={getOptimizedImageUrl(field.images[0]) || "/placeholder.svg"}
                              src={getFullImageUrl(field.images[0]) || "/placeholder.svg"}
                              alt={field.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-4xl">🏟️</div>
                          )}
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{field.name}</CardTitle>
                          <CardDescription>{field.sport_type}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-primary">{field.price.toLocaleString()}đ/giờ</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground line-clamp-1">{field.address}</span>
                          </div>
                          {field.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">{field.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2 & 3: Date and Time Selection */}
          {step !== "field" && selectedField && (
            <div className="space-y-8">
              {/* Selected Field Info */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedField.name}</CardTitle>
                      <CardDescription>{selectedField.sport_type}</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setStep("field")}>
                      ← Đổi sân
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Date Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>📅 Chọn ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
                </CardContent>
              </Card>

              {/* Time Slot Grid */}
              {step === "time" && (
                <Card>
                  <CardHeader>
                    <CardTitle>⏰ Chọn giờ</CardTitle>
                    <CardDescription>
                      {selectedDate.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TimeSlotGrid
                      bookings={bookings}
                      selectedSlotId={selectedBooking?.id}
                      onSlotSelect={handleSlotSelect}
                      currentUserId={currentUserId}
                      isLoading={loadingBookings}
                      fieldPrice={selectedField?.price || 0}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        <BookingConfirmationModal
          booking={confirmingBooking}
          isOpen={!!confirmingBooking}
          onClose={() => setConfirmingBooking(null)}
          onConfirm={handleConfirmBooking}
          isLoading={submitting}
        />
      </div>
    </ProtectedRoute>
  )
}
