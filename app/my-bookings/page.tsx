"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getBookings, updateBooking, type Booking } from "@/lib/booking-api"
import { Calendar, Clock, MapPin, Loader2, AlertCircle } from "lucide-react"

export default function MyBookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)

  const currentUserId = typeof window !== "undefined" ? Number.parseInt(localStorage.getItem("user_id") || "0") : 0

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await getBookings({
          ordering: "-booking_date",
          limit: 100,
        })
        setBookings(response.results || [])
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải lịch đặt sân",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [toast])

  const handleCancelBooking = async (bookingId: number) => {
    try {
      setCancelling(bookingId)
      await updateBooking(bookingId, { status: "PENDING" })

      toast({
        title: "Thành công",
        description: "✅ Bạn đã hủy đặt sân",
      })

      // Refresh bookings
      const response = await getBookings({
        ordering: "-booking_date",
        limit: 100,
      })
      setBookings(response.results || [])
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể hủy đặt sân",
        variant: "destructive",
      })
    } finally {
      setCancelling(null)
    }
  }

  const handleBookAgain = async (booking: Booking) => {
    try {
      setCancelling(booking.id)
      await updateBooking(booking.id, { status: "CONFIRMED" })

      toast({
        title: "Thành công",
        description: "🎉 Bạn đã đặt sân thành công!",
      })

      // Refresh bookings
      const response = await getBookings({
        ordering: "-booking_date",
        limit: 100,
      })
      setBookings(response.results || [])
    } catch (error) {
      console.error("Failed to book again:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể đặt sân",
        variant: "destructive",
      })
    } finally {
      setCancelling(null)
    }
  }

  const upcomingBookings = bookings.filter((b) => b.status === "CONFIRMED")
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED")
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED")

  const BookingCard = ({
    booking,
    showCancel = false,
    showBookAgain = false,
  }: { booking: Booking; showCancel?: boolean; showBookAgain?: boolean }) => {
    const bookingDate = new Date(booking.booking_date)
    const dateStr = bookingDate.toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })

    return (
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">🏟️ {booking.sport_field.name}</CardTitle>
              <CardDescription>{booking.sport_field.sport_type}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{booking.price.toLocaleString()}đ</div>
              <div className="text-xs text-muted-foreground">
                {booking.status === "CONFIRMED" && "🔵 Đã đặt"}
                {booking.status === "COMPLETED" && "🟡 Hoàn thành"}
                {booking.status === "CANCELLED" && "🔴 Đã hủy"}
                {booking.status === "PENDING" && "✅ Trống"}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{dateStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{booking.rental_slot.time_slot}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{booking.sport_field.address}</span>
          </div>

          {(showCancel || showBookAgain) && (
            <div className="flex gap-2 pt-2">
              {showCancel && (
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => handleCancelBooking(booking.id)}
                  disabled={cancelling === booking.id}
                >
                  {cancelling === booking.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang hủy...
                    </>
                  ) : (
                    "❌ Hủy đặt"
                  )}
                </Button>
              )}
              {showBookAgain && (
                <Button
                  className="flex-1"
                  onClick={() => handleBookAgain(booking)}
                  disabled={cancelling === booking.id}
                >
                  {cancelling === booking.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đặt...
                    </>
                  ) : (
                    "📝 Đặt lại"
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">📚 Lịch đặt sân của bạn</h1>
            <p className="mt-2 text-muted-foreground">Quản lý và theo dõi các đặt sân của bạn</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Chưa có đặt sân nào</h3>
                  <p className="text-muted-foreground">Hãy bắt đầu đặt sân ngay hôm nay!</p>
                </div>
                <Button asChild>
                  <a href="/booking">📅 Đặt sân ngay</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">🔵 Sắp tới ({upcomingBookings.length})</TabsTrigger>
                <TabsTrigger value="completed">🟡 Hoàn thành ({completedBookings.length})</TabsTrigger>
                <TabsTrigger value="cancelled">🔴 Đã hủy ({cancelledBookings.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                      <p className="text-muted-foreground">Không có đặt sân sắp tới</p>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} showCancel />)
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedBookings.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                      <p className="text-muted-foreground">Không có đặt sân hoàn thành</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} showBookAgain />)
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4">
                {cancelledBookings.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                      <p className="text-muted-foreground">Không có đặt sân đã hủy</p>
                    </CardContent>
                  </Card>
                ) : (
                  cancelledBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
