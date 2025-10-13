"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import { handleApiError } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"
import type { SportField } from "@/lib/api"

export default function SportFieldsPage() {
  const [fields, setFields] = useState<SportField[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [priceFilter, setPriceFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const itemsPerPage = 12

  useEffect(() => {
    console.log("[v0] SportFieldsPage mounted, calling fetchFields")
    fetchFields()
  }, [currentPage, sortBy, priceFilter])

  const fetchFields = async () => {
    try {
      console.log("[v0] Fetching sport fields from API...")
      setLoading(true)
      const data = await apiClient.getAllSportFields()
      console.log("[v0] Received sport fields data:", data)

      // Apply search filter
      let filtered = data
      if (searchQuery) {
        filtered = data.filter((field) => field.name.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      // Apply price filter
      if (priceFilter !== "all") {
        filtered = filtered.filter((field) => {
          if (priceFilter === "low") return field.price < 100000
          if (priceFilter === "medium") return field.price >= 100000 && field.price < 200000
          if (priceFilter === "high") return field.price >= 200000
          return true
        })
      }

      // Apply sorting
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name)
        if (sortBy === "price-asc") return a.price - b.price
        if (sortBy === "price-desc") return b.price - a.price
        return 0
      })

      // Calculate pagination
      setTotalPages(Math.ceil(sorted.length / itemsPerPage))
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage)

      console.log("[v0] Setting fields state with:", paginatedData)
      setFields(paginatedData)
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

  const getImageUrl = (filePath: string) => {
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${filePath}`
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
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên sân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} className="font-bold">
                Tìm kiếm
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-bold">Bộ lọc:</span>
              </div>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả giá</SelectItem>
                  <SelectItem value="low">Dưới 100k</SelectItem>
                  <SelectItem value="medium">100k - 200k</SelectItem>
                  <SelectItem value="high">Trên 200k</SelectItem>
                </SelectContent>
              </Select>

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
                            src={getImageUrl(field.images[0].file) || "/placeholder.svg"}
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
                      <CardDescription className="text-base font-semibold text-accent">
                        {field.price.toLocaleString("vi-VN")}đ/giờ
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild className="w-full font-bold">
                        <Link href={`/sport-fields/${field.id}`}>Xem chi tiết</Link>
                      </Button>
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
