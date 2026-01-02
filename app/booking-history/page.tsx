"use client"

import { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type Booking, type BookingListResponse } from "@/lib/api"
import { handleApiError } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

export default function BookingHistoryPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // simple filters
  const [status, setStatus] = useState<"" | "PENDING" | "CONFIRMED">("")
  const [bookingId, setBookingId] = useState("")

  // pagination
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const offset = useMemo(() => (page - 1) * limit, [page, limit])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = { limit, offset }

      // If role is USER -> no need to add user filter (handled by BE)
      // If role is OWNER or ADMIN -> add user filter to current user id
      if (user && (user.role === "OWNER" || user.role === "ADMIN")) {
        params.user = user.id
      }

      if (status) params.status = status
      if (bookingId) params.id = bookingId

      const data: BookingListResponse = await apiClient.getBookingManage(params)
      setBookings(data.results)
      setCount(data.count)
    } catch (error) {
      const { title, description } = handleApiError(error)
      toast({ title, description, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset])

  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Lịch Sử Đặt Sân</h1>
          <p className="text-muted-foreground">Xem lại các lượt đặt sân của bạn</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bộ lọc đơn giản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Booking ID</Label>
                <Input
                  type="number"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="VD: 12345"
                />
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={status || "all"} onValueChange={(v: any) => setStatus(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="PENDING">Chưa được thuê</SelectItem>
                    <SelectItem value="CONFIRMED">Đã được thuê</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trang</Label>
                <Input
                  type="number"
                  min={1}
                  value={String(page)}
                  onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
                  placeholder="VD: 1"
                />
              </div>

              <div className="space-y-2">
                <Label>Hiển thị mỗi trang (limit)</Label>
                <Input
                  type="number"
                  min={1}
                  value={String(limit)}
                  onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 10))}
                  placeholder="VD: 10"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={() => { setPage(1); fetchBookings() }}>Áp dụng</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBookingId("")
                  setStatus("")
                  setPage(1)
                  setLimit(10)
                  fetchBookings()
                }}
              >
                Làm mới
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kết quả ({count})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Calendar className="mr-2 h-5 w-5" /> Đang tải...
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">Không có dữ liệu</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-2 text-left align-middle font-medium">ID</th>
                      <th className="h-10 px-2 text-left align-middle font-medium">Trung tâm</th>
                      <th className="h-10 px-2 text-left align-middle font-medium">Sân</th>
                      <th className="h-10 px-2 text-left align-middle font-medium">Khung giờ</th>
                      <th className="h-10 px-2 text-left align-middle font-medium">Ngày</th>
                      <th className="h-10 px-2 text-left align-middle font-medium">Trạng thái</th>
                      <th className="h-10 px-2 text-right align-middle font-medium">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b hover:bg-muted/50">
                        <td className="px-2 py-3">{b.id}</td>
                        <td className="px-2 py-3">{b.sport_field?.sport_center?.name ?? "-"}</td>
                        <td className="px-2 py-3">{b.sport_field?.name ?? "-"}</td>
                        <td className="px-2 py-3">{b.rental_slot?.time_slot ?? "-"}</td>
                        <td className="px-2 py-3">{b.booking_date}</td>
                        <td className="px-2 py-3">
                          <Badge variant={b.status === "CONFIRMED" ? "default" : "secondary"}>{b.status}</Badge>
                        </td>
                        <td className="px-2 py-3 text-right">{b.price?.toLocaleString("vi-VN")}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Trang {page}/{totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
