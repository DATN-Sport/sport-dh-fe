"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api"
import { handleApiError } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, DollarSign, Building2, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import type { SportField } from "@/lib/api"

export default function SportFieldDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [field, setField] = useState<SportField | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { toast } = useToast()

  const getImageUrl = (filePath: string) => {
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${filePath}`
  }

  const getOptimizedImageUrl = (image: { preview?: string; file: string }) => {
    // Use preview image if available for better performance
    const imagePath = image.preview || image.file
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${imagePath}`
  }

  const getFullImageUrl = (image: { preview?: string; file: string }) => {
    return `${process.env.NEXT_PUBLIC_MEDIA_API_URL}/${image.file}`
  }

  useEffect(() => {
    fetchFieldDetail()
  }, [params.id])

  const fetchFieldDetail = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getSportField(Number(params.id))
      setField(data)
    } catch (error) {
      const { title, description } = handleApiError(error)
      toast({ title, description, variant: "destructive" })
    } finally {
      setLoading(false)
    }
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

  if (!field) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">Không tìm thấy sân</h2>
          <Button onClick={() => router.push("/sport-fields")}>Quay lại danh sách</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push("/sport-fields")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        {/* Field Info */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            {field.images && field.images.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={getFullImageUrl(field.images[selectedImageIndex]) || "/placeholder.svg"}
                    alt={field.name}
                    className="h-96 w-full object-cover"
                  />
                </div>
                {field.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {field.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`cursor-pointer overflow-hidden rounded-lg transition-all ${
                          selectedImageIndex === idx
                            ? "ring-2 ring-primary ring-offset-2"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setSelectedImageIndex(idx)}
                      >
                        <img
                          src={getOptimizedImageUrl(img) || "/placeholder.svg"}
                          alt={`${field.name} ${idx + 1}`}
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
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2">
                Sân thể thao
              </Badge>
              <h1 className="mb-2 text-4xl font-bold">{field.name}</h1>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{field.price.toLocaleString("vi-VN")}đ</span>
                <span className="text-muted-foreground">/giờ</span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold">Thông tin sân</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Trung tâm</p>
                      {field.center_info ? (
                        <div>
                          <p className="font-medium">{field.center_info.name}</p>
                          <p className="text-sm text-muted-foreground">{field.center_info.address}</p>
                        </div>
                      ) : (
                        <Link href={`/sport-centers/${field.sport_center}`} className="font-medium hover:underline">
                          Xem trung tâm
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Đặt sân</h3>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Chọn ngày và giờ để đặt sân. Hệ thống sẽ hiển thị các khung giờ trống.
                  </p>
                  <Link href={`/booking?field=${field.id}`} className="block">
                    <Button className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Đặt sân ngay
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
