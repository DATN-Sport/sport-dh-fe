"use client"

import { useEffect, useMemo, useState } from "react"
import { OwnerRoute } from "@/components/owner-route"
import { OwnerSidebar } from "@/components/owner-sidebar"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  apiClient,
  type Booking,
  type BookingListResponse,
  type SportCenter,
  type SportField,
  type BookingStatsResponse,
} from "@/lib/api"
import { handleApiError } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

export default function OwnerBookingManagePage() {
  const { toast } = useToast()

  const [centers, setCenters] = useState<SportCenter[]>([])
  const [fields, setFields] = useState<SportField[]>([])

  const [bookings, setBookings] = useState<Booking[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // stats
  const [stats, setStats] = useState<BookingStatsResponse | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsPreset, setStatsPreset] = useState<"today" | "this_week" | "this_month" | "this_quarter">("this_month")

  // filters
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1) // page -> offset = (page-1)*limit
  const offset = useMemo(() => (page - 1) * limit, [page, limit])

  const [sportCenter, setSportCenter] = useState<number | "">("")
  const [sportField, setSportField] = useState<number | "">("")
  const [rentalSlot, setRentalSlot] = useState<number | "">("")
  const [status, setStatus] = useState<"" | "PENDING" | "CONFIRMED">("")
  const [bookingDateAfter, setBookingDateAfter] = useState("")
  const [bookingDateBefore, setBookingDateBefore] = useState(() => {
    // Mặc định là ngày hôm nay
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [bookingDateExact, setBookingDateExact] = useState("")
  const [month, setMonth] = useState<number | "">("")
  const [year, setYear] = useState<number | "">("")
  const [user, setUser] = useState("")

  const fetchStats = async (preset?: "today" | "this_week" | "this_month" | "this_quarter") => {
    try {
      setStatsLoading(true)
      const data = await apiClient.getBookingStats({
        preset: preset ?? statsPreset,
        limit_top_fields: 5,
      })
      setStats(data)
    } catch (error) {
      const { title, description } = handleApiError(error)
      toast({ title, description, variant: "destructive" })
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const [centersData, fieldsData] = await Promise.all([
          apiClient.getAllSportCenters(),
          apiClient.getAllSportFields(),
        ])
        setCenters(centersData)
        setFields(fieldsData)
      } catch (error) {
        const { title, description } = handleApiError(error)
        toast({ title, description, variant: "destructive" })
      }
    }
    init()
  }, [toast])

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = { limit, offset }
      if (sportCenter !== "") params.sport_center = Number(sportCenter)
      if (sportField !== "") params.sport_field = Number(sportField)
      if (rentalSlot !== "") params.rental_slot = Number(rentalSlot)
      if (status) params.status = status
      if (bookingDateAfter) params.booking_date_after = bookingDateAfter
      if (bookingDateBefore) params.booking_date_before = bookingDateBefore
      if (bookingDateExact) params.booking_date_ = bookingDateExact
      if (month !== "") params.month = Number(month)
      if (year !== "") params.year = Number(year)
      if (user) params.user = user

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

  // Xóa useEffect tự động filter - chỉ filter khi click "Áp dụng"
  // Fetch lần đầu khi component mount với filter mặc định
  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.max(1, Math.ceil(count / limit))

  const filteredFields = useMemo(() => {
    if (sportCenter === "") return fields
    return fields.filter((f) => f.sport_center === Number(sportCenter))
  }, [fields, sportCenter])

  return (
    <OwnerRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <OwnerSidebar />
          <main className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Quản lý booking</h1>
              <p className="text-muted-foreground">Xem và lọc các booking theo nhiều tiêu chí</p>
            </div>

            {/* Revenue stats */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Thống kê doanh thu</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Dựa trên booking đã xác nhận/hoàn tất, hiển thị trong phạm vi trung tâm của bạn.
                  </p>
                </div>
                <div className="w-40">
                  <Label className="mb-1 block text-xs">Khoảng thời gian</Label>
                  <Select
                    value={statsPreset}
                    onValueChange={(v: any) => {
                      const preset = v as "today" | "this_week" | "this_month" | "this_quarter"
                      setStatsPreset(preset)
                      fetchStats(preset)
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hôm nay</SelectItem>
                      <SelectItem value="this_week">Tuần này</SelectItem>
                      <SelectItem value="this_month">Tháng này</SelectItem>
                      <SelectItem value="this_quarter">Quý này</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading && (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">
                    <Calendar className="mr-2 h-5 w-5" /> Đang tải thống kê...
                  </div>
                )}
                {!statsLoading && stats && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="text-xs font-medium text-muted-foreground">Tổng doanh thu</div>
                        <div className="mt-2 text-2xl font-bold">
                          {stats.summary.total_revenue.toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="text-xs font-medium text-muted-foreground">Tổng số booking</div>
                        <div className="mt-2 text-2xl font-bold">
                          {stats.summary.total_bookings.toLocaleString("vi-VN")}
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="text-xs font-medium text-muted-foreground">Theo trạng thái</div>
                        <div className="mt-2 space-y-1 text-sm">
                          {stats.by_status.map((s) => (
                            <div key={s.status} className="flex items-center justify-between">
                              <span>{s.status}</span>
                              <span className="font-mono text-xs">
                                {s.revenue.toLocaleString("vi-VN")}đ ({s.count})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {stats.by_center.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Doanh thu theo trung tâm</div>
                        <ChartContainer
                          config={{
                            revenue: {
                              label: "Doanh thu",
                              // Màu cam sáng theo style tham chiếu
                              color: "hsl(24 95% 55%)",
                            },
                          }}
                          className="h-72 w-full rounded-xl bg-muted/30 px-4 py-6"
                        >
                          <BarChart data={stats.by_center}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="center_name" tickLine={false} tickMargin={8} />
                            <YAxis tickLine={false} tickMargin={8} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar
                              dataKey="revenue"
                              fill="var(--color-revenue)"
                              radius={8}
                              stroke="transparent"
                            />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Bộ lọc</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Trung tâm</Label>
                    <Select value={sportCenter === "" ? "all" : String(sportCenter)} onValueChange={(v) => setSportCenter(v === "all" ? "" : Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trung tâm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {centers.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sân</Label>
                    <Select value={sportField === "" ? "all" : String(sportField)} onValueChange={(v) => setSportField(v === "all" ? "" : Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả sân" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {filteredFields.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label>Người dùng (Email)</Label>
                    <Input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Email" />
                  </div>

                  <div className="space-y-2">
                    <Label>Khung giờ (ID)</Label>
                    <Input value={rentalSlot === "" ? "" : String(rentalSlot)} onChange={(e) => setRentalSlot(e.target.value ? Number(e.target.value) : "")} placeholder="Rental Slot ID" />
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày sau (booking_date_after)</Label>
                    <Input type="date" value={bookingDateAfter} onChange={(e) => setBookingDateAfter(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày trước (booking_date_before)</Label>
                    <Input type="date" value={bookingDateBefore} onChange={(e) => setBookingDateBefore(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày đúng (booking_date_)</Label>
                    <Input type="date" value={bookingDateExact} onChange={(e) => setBookingDateExact(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Tháng</Label>
                    <Input type="number" value={month === "" ? "" : String(month)} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : "")} placeholder="VD: 12" />
                  </div>

                  <div className="space-y-2">
                    <Label>Năm</Label>
                    <Input type="number" value={year === "" ? "" : String(year)} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} placeholder="VD: 2025" />
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
                      max={150}
                      value={String(limit)}
                      onChange={(e) => setLimit(Math.max(1, Math.min(150, Number(e.target.value) || 10)))}
                      placeholder="VD: 10"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => { setPage(1); fetchBookings(); }}>Áp dụng</Button>
                  <Button variant="outline" onClick={() => {
                    setSportCenter("")
                    setSportField("")
                    setRentalSlot("")
                    setStatus("")
                    setBookingDateAfter("")
                    // Reset về ngày hôm nay
                    const today = new Date()
                    setBookingDateBefore(today.toISOString().split('T')[0])
                    setBookingDateExact("")
                    setMonth("")
                    setYear("")
                    setUser("")
                    setPage(1)
                    fetchBookings()
                  }}>Làm mới</Button>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
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
                          <th className="h-10 px-2 text-left align-middle font-medium">Người dùng</th>
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
                            <td className="px-2 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium">{b.user?.full_name ?? "-"}</span>
                                <span className="text-xs text-muted-foreground">{b.user?.email ?? ""}</span>
                              </div>
                            </td>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setPage((p) => Math.max(1, p - 1)); fetchBookings(); }} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      Trang {page}/{totalPages}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); fetchBookings(); }} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </OwnerRoute>
  )
}
