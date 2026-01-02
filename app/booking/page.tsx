"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { DateSelector } from "@/components/booking/date-selector"
import { TimeSlotGrid } from "@/components/booking/time-slot-grid"
import { BookingConfirmationModal } from "@/components/booking/booking-confirmation-modal"
import { useToast } from "@/hooks/use-toast"
import { getBookings, updateBooking, type Booking } from "@/lib/booking-api"
import { getSportFields } from "@/lib/api"
import { MapPin, DollarSign, Star, Search, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

const DISTRICTS = ["Hải Châu", "Thanh Khê", "Cẩm Lệ", "Ngũ Hành Sơn", "Liên Chiểu", "Sơn Trà", "Hòa Vang"]
const SPORT_TYPES = [
  { value: "FOOTBALL", label: "Bóng đá" },
  { value: "BADMINTON", label: "Cầu lông" },
  { value: "TENNIS", label: "Tennis" },
  { value: "PICK_A_BALL", label: "Pick a ball" },
]

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface SportField {
  id: number
  name: string
  sport_type: string
  address: string
  price: number
  rating?: number
  center_info?: {
    name: string
    address: string
  }
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
  const [rawFields, setRawFields] = useState<SportField[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingFields, setLoadingFields] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const searchParams = useSearchParams()

  // Filter states
  const [centerNameFilter, setCenterNameFilter] = useState("")
  const [sportTypeFilter, setSportTypeFilter] = useState("")
  const [addressFilter, setAddressFilter] = useState("")
  const [maxPrice, setMaxPrice] = useState<number>(1000000)
  const [districtPopoverOpen, setDistrictPopoverOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 9

  const currentUserId = typeof window !== "undefined" ? Number.parseInt(localStorage.getItem("user_id") || "0") : 0

  const getOptimizedImageUrl = (image: { preview?: string; file: string }) => {
    // Use preview image if available for better performance
    const imagePath = image.preview || image.file
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${imagePath}`
  }

  const getFullImageUrl = (image: { preview?: string; file: string }) => {
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${image.file}`
  }

  useEffect(() => {
    const field = searchParams.get("field")
    if (!field) return

    const numberF = Number(field)
    if (!numberF) return

    const findField = rawFields.find((f) => f.id === numberF)
    if (!findField) return

    setSelectedField(findField)
    setStep("date")
  }, [rawFields, searchParams])

  // Fetch sport fields
  const fetchFields = async () => {
    try {
      setLoadingFields(true)
      // Clear previous data immediately when starting new fetch
      setRawFields([])
      setFields([])
      
      // Build filter params
      const params: {
        status: string
        center_name?: string
        sport_type?: string
        address?: string
        price_lte?: number
      } = {
        status: "ACTIVE",
      }

      if (centerNameFilter.trim()) {
        params.center_name = centerNameFilter.trim()
      }

      if (sportTypeFilter && sportTypeFilter.trim()) {
        params.sport_type = sportTypeFilter.trim()
      }

      if (addressFilter.trim()) {
        params.address = addressFilter.trim()
      }

      // Add price filter if maxPrice is set
      if (maxPrice) {
        params.price_lte = maxPrice
      }

      const response = await getSportFields(params)
      const list = response.results || []
      setRawFields(list)
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

  useEffect(() => {
    fetchFields()
  }, [toast])

  // Apply pagination to raw fields
  useEffect(() => {
    if (rawFields.length === 0) {
      setFields([])
      setTotalPages(1)
      return
    }

    const pages = Math.max(1, Math.ceil(rawFields.length / itemsPerPage))
    setTotalPages(pages)

    const safePage = Math.min(currentPage, pages)
    if (safePage !== currentPage) {
      setCurrentPage(safePage)
    }

    const startIndex = (safePage - 1) * itemsPerPage
    const paginated = rawFields.slice(startIndex, startIndex + itemsPerPage)
    setFields(paginated)
  }, [rawFields, currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFields()
  }

  const handleDistrictSelect = (district: string) => {
    setAddressFilter(district)
    setDistrictPopoverOpen(false)
  }

  // Fetch bookings when field and date change
  useEffect(() => {
    if (!selectedField) return

    const fetchBookings = async () => {
      try {
        setLoadingBookings(true)
        const response = await getBookings({
          sport_field: selectedField.id,
          booking_date_: formatDateLocal(selectedDate),
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
        booking_date_: formatDateLocal(selectedDate),
        ordering: "rental_slot",
      })
      setBookings(response as unknown as Booking[] || [])
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

          {/* Filter Section - Only show when selecting field */}
          {step === "field" && (
            <div className="mb-8 space-y-4">
              <section className="border-b border-border/50 bg-card/50 py-6 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium">Tên trung tâm</label>
                        <Input
                          placeholder="Nhập tên trung tâm..."
                          value={centerNameFilter}
                          onChange={(e) => setCenterNameFilter(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                      </div>

                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium">Loại sân</label>
                        <Select value={sportTypeFilter || undefined} onValueChange={(value) => setSportTypeFilter(value || "")}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tất cả loại sân" />
                          </SelectTrigger>
                          <SelectContent>
                            {SPORT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium">Địa chỉ</label>
                        <div className="relative">
                          <Input
                            placeholder="Nhập địa chỉ hoặc chọn quận..."
                            value={addressFilter}
                            onChange={(e) => setAddressFilter(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="pr-10"
                          />
                          <Popover open={districtPopoverOpen} onOpenChange={setDistrictPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="end">
                              <div className="p-1">
                                {DISTRICTS.map((district) => (
                                  <button
                                    key={district}
                                    type="button"
                                    onClick={() => handleDistrictSelect(district)}
                                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  >
                                    {district}
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <Button onClick={handleSearch} className="font-bold">
                        <Search className="mr-2 h-4 w-4" />
                        Tìm kiếm
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-bold">Bộ lọc:</span>
                      </div>

                      <div className="flex items-end gap-4 min-w-[360px] max-w-xl">
                        <div className="flex-1">
                          <label className="mb-2 block text-sm font-medium">
                            Giá tối đa: {maxPrice.toLocaleString("vi-VN")}đ
                          </label>
                          <Slider
                            value={[maxPrice]}
                            onValueChange={(value) => setMaxPrice(value[0])}
                            min={50000}
                            max={1000000}
                            step={50000}
                            className="w-full"
                          />
                        </div>
                        <div className="w-32">
                          <label className="mb-2 block text-xs font-medium text-muted-foreground">Nhập giá</label>
                          <Input
                            type="number"
                            min={50000}
                            max={1000000}
                            step={50000}
                            value={maxPrice}
                            onChange={(e) => {
                              const value = Number(e.target.value) || 0
                              const clamped = Math.min(1000000, Math.max(50000, value))
                              setMaxPrice(clamped)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

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
                  <>
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
                            <CardDescription>
                              {field.center_info?.name ? `${field.center_info.name} • ${field.sport_type}` : field.sport_type}
                            </CardDescription>
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

                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, i) => (
                            <Button
                              key={i}
                              variant={currentPage === i + 1 ? "default" : "outline"}
                              size="icon"
                              onClick={() => setCurrentPage(i + 1)}
                              className={currentPage === i + 1 ? "font-bold" : ""}
                            >
                              {i + 1}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
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
                      <CardDescription>
                        {selectedField.center_info?.name
                          ? `${selectedField.center_info.name} • ${selectedField.sport_type}`
                          : selectedField.sport_type}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setStep("field");
                        router.replace("/booking");
                      }}
                    >
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
