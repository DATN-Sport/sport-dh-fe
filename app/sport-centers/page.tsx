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
import { MapPin, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import Link from "next/link"
import type { SportCenter } from "@/lib/api"

export default function SportCentersPage() {
  const [centers, setCenters] = useState<SportCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const itemsPerPage = 9

  useEffect(() => {
    fetchCenters()
  }, [currentPage, sortBy])

  const fetchCenters = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getAllSportCenters()

      // Apply search filter
      let filtered = data
      if (searchQuery) {
        filtered = data.filter(
          (center) =>
            center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            center.address.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      // Apply sorting
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name)
        return 0
      })

      // Calculate pagination
      setTotalPages(Math.ceil(sorted.length / itemsPerPage))
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage)

      setCenters(paginatedData)
    } catch (error) {
      const { title, description } = handleApiError(error)
      toast({ title, description, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCenters()
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

      <section className="relative overflow-hidden bg-gradient-to-br from-secondary/20 via-background to-primary/20 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-balance text-5xl font-black tracking-tight md:text-6xl">
              Khám phá trung tâm thể thao
            </h1>
            <p className="text-pretty text-xl text-muted-foreground">
              Tìm kiếm và đặt sân tại các trung tâm thể thao hàng đầu Đà Nẵng
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-card/50 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-2">
                  <div className="h-56 animate-pulse bg-muted" />
                  <CardHeader>
                    <div className="h-6 animate-pulse rounded bg-muted" />
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : centers.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-bold">Không tìm thấy trung tâm</h3>
              <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {centers.map((center) => (
                  <Card
                    key={center.id}
                    className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/20"
                  >
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                      {center.images && center.images.length > 0 ? (
                        <>
                          <img
                            src={getOptimizedImageUrl(center.images[0]) || "/placeholder.svg"}
                            alt={center.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute right-3 top-3">
                        <Badge className="bg-primary font-bold text-primary-foreground">
                          {center.sport_fields?.length || 0} sân
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1 text-xl">{center.name}</CardTitle>
                      <CardDescription className="flex items-start gap-2 text-base">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="line-clamp-2">{center.address}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild className="w-full font-bold">
                        <Link href={`/sport-centers/${center.id}`}>Xem chi tiết</Link>
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
