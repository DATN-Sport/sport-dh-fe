"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import { handleApiError } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Calendar, ChevronDown, Clock } from "lucide-react"
import Link from "next/link"
import type { SportField } from "@/lib/api"

const DISTRICTS = ["Hải Châu", "Thanh Khê", "Cẩm Lệ", "Ngũ Hành Sơn", "Liên Chiểu", "Sơn Trà", "Hòa Vang"]
const SPORT_TYPES = [
  { value: "FOOTBALL", label: "Bóng đá" },
  { value: "BADMINTON", label: "Cầu lông" },
  { value: "TENNIS", label: "Tennis" },
  { value: "PICK_A_BALL", label: "Pick a ball" },
]

export default function SportFieldsPage() {
  const [fields, setFields] = useState<SportField[]>([])
  const [loading, setLoading] = useState(true)
  const [centerNameFilter, setCenterNameFilter] = useState("")
  const [sportTypeFilter, setSportTypeFilter] = useState("")
  const [addressFilter, setAddressFilter] = useState("")
  const [districtPopoverOpen, setDistrictPopoverOpen] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [maxPrice, setMaxPrice] = useState<number>(500000)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const itemsPerPage = 12

  useEffect(() => {
    fetchFields()
  }, [currentPage])

  // Store raw data from API
  const [rawFields, setRawFields] = useState<SportField[]>([])

  // Apply client-side filters when sort or raw data changes
  useEffect(() => {
    // If no data, clear fields and reset pagination
    if (rawFields.length === 0) {
      setFields([])
      setTotalPages(1)
      return
    }

    // Apply sorting
    const sorted = [...rawFields].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "price-asc") return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      return 0
    })

    // Calculate pagination
    setTotalPages(Math.ceil(sorted.length / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage)

    setFields(paginatedData)
  }, [sortBy, rawFields, currentPage])

  const fetchFields = async () => {
    try {
      setLoading(true)
      // Clear previous data immediately when starting new fetch
      setRawFields([])
      setFields([])

      // Build filter params - auto set status=ACTIVE for guest page
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

      // Add price filter if maxPrice is set (always send price_lte)
      if (maxPrice) {
        params.price_lte = maxPrice
      }

      const data = await apiClient.getAllSportFields(params)
      
      // Store raw data for client-side filtering
      setRawFields(data)
    } catch (error) {
      console.log("[v0] Error fetching sport fields:", error)
      const { title, description } = handleApiError(error)
      toast({ title, description, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFields()
  }

  const handleDistrictSelect = (district: string) => {
    setAddressFilter(district)
    setDistrictPopoverOpen(false)
  }

  const getImageUrl = (filePath: string) => {
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${filePath}`
  }

  const getOptimizedImageUrl = (image: { preview?: string; file: string }) => {
    // Use preview image if available for better performance
    const imagePath = image.preview || image.file
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${imagePath}`
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-balance text-5xl font-black tracking-tight md:text-6xl">Tìm sân thể thao</h1>
            <p className="text-pretty text-xl text-muted-foreground">Khám phá và đặt sân phù hợp với nhu cầu của bạn</p>
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-card/50 py-8 backdrop-blur-sm">
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

              <div className="flex items-center gap-4 min-w-[300px]">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium">
                    Giá tối đa: {maxPrice.toLocaleString("vi-VN")}đ
                  </label>
                  <Slider
                    value={[maxPrice]}
                    onValueChange={(value) => setMaxPrice(value[0])}
                    min={50000}
                    max={500000}
                    step={10000}
                    className="w-full"
                  />
                </div>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                  <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-2">
                  <div className="h-48 animate-pulse bg-muted" />
                  <CardHeader>
                    <div className="h-6 animate-pulse rounded bg-muted" />
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : fields.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-bold">Không tìm thấy sân</h3>
              <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {fields.map((field) => (
                  <Card
                    key={field.id}
                    className="group overflow-hidden border-2 transition-all hover:border-accent hover:shadow-2xl hover:shadow-accent/20"
                  >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-accent/20 to-primary/20">
                      {field.images && field.images.length > 0 ? (
                        <>
                          <img
                            src={getOptimizedImageUrl(field.images[0]) || "/placeholder.svg"}
                            alt={field.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Calendar className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute right-3 top-3">
                        <Badge className="bg-accent font-bold text-accent-foreground">
                          {field.price.toLocaleString("vi-VN")}đ
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1 text-lg">{field.name}</CardTitle>
                      {field.center_info && (
                        <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                          {field.center_info.name}
                        </CardDescription>
                      )}
                      <CardDescription className="text-base font-semibold text-accent">
                        {field.price.toLocaleString("vi-VN")}đ/giờ
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <div className="flex w-full gap-2">
                        <Button asChild className="w-1/2 font-bold" variant="outline">
                          <Link href={`/sport-fields/${field.id}`}>Xem chi tiết</Link>
                        </Button>
                        <Button asChild className="w-1/2 font-bold" variant="destructive">
                          <Link href={`/booking?field=${field.id}`} className="inline-flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4" />
                            Đặt sân ngay
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
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
      </section>
    </div>
  )
}
