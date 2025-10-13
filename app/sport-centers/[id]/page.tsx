"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api"
import { handleApiError } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"
import { MapPin, ArrowLeft, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import type { SportCenter, SportField } from "@/lib/api"

export default function SportCenterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [center, setCenter] = useState<SportCenter | null>(null)
  const [fields, setFields] = useState<SportField[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCenterDetail()
  }, [params.id])

  const fetchCenterDetail = async () => {
    try {
      setLoading(true)
      const centerData = await apiClient.getSportCenter(Number(params.id))
      const fieldsData = await apiClient.getAllSportFields({ sport_center: Number(params.id) })

      setCenter(centerData)
      setFields(fieldsData)
    } catch (error) {
      const { title, description } = handleApiError(error)
      toast({ title, description, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (filePath: string) => {
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${filePath}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">Không tìm thấy trung tâm</h2>
          <Button onClick={() => router.push("/sport-centers")}>Quay lại danh sách</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push("/sport-centers")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        {/* Center Info */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            {center.images && center.images.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={getImageUrl(center.images[0].file) || "/placeholder.svg"}
                    alt={center.name}
                    className="h-96 w-full object-cover"
                  />
                </div>
                {center.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {center.images.slice(1, 5).map((img, idx) => (
                      <div key={idx} className="overflow-hidden rounded-lg">
                        <img
                          src={getImageUrl(img.file) || "/placeholder.svg"}
                          alt={`${center.name} ${idx + 2}`}
                          className="h-24 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-96 items-center justify-center rounded-lg bg-muted">
                <p className="text-muted-foreground">Chưa có hình ảnh</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="mb-4 text-4xl font-bold">{center.name}</h1>
            <div className="mb-6 flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-1 h-5 w-5 shrink-0" />
              <p>{center.address}</p>
            </div>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Thông tin</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số lượng sân:</span>
                    <span className="font-medium">{fields.length} sân</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fields List */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">Danh sách sân ({fields.length})</h2>
          {fields.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Chưa có sân nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((field) => (
                <Card key={field.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {field.images && field.images.length > 0 ? (
                      <img
                        src={getImageUrl(field.images[0].file) || "/placeholder.svg"}
                        alt={field.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{field.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {field.price.toLocaleString("vi-VN")}đ/giờ
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full bg-transparent" variant="outline">
                      <Link href={`/sport-fields/${field.id}`}>Xem chi tiết</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
