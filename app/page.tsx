"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Trophy, Users } from "lucide-react"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                Đặt sân thể thao dễ dàng tại Đà Nẵng
              </h1>
              <p className="mb-8 text-pretty text-lg text-muted-foreground">
                Tìm và đặt sân bóng đá, cầu lông, tennis và nhiều môn thể thao khác chỉ với vài cú click
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  <Calendar className="h-5 w-5" />
                  Đặt sân ngay
                </Button>
                <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                  <MapPin className="h-5 w-5" />
                  Xem sân gần bạn
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Tại sao chọn Sport DH?</h2>
              <p className="text-muted-foreground">Nền tảng đặt sân thể thao hàng đầu tại Đà Nẵng</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Đặt sân nhanh chóng</CardTitle>
                  <CardDescription>Đặt sân chỉ trong vài phút với giao diện đơn giản, dễ sử dụng</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>Nhiều địa điểm</CardTitle>
                  <CardDescription>Hơn 50+ sân thể thao chất lượng cao trên khắp Đà Nẵng</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Giá cả hợp lý</CardTitle>
                  <CardDescription>Giá cả minh bạch, nhiều ưu đãi và chương trình khuyến mãi</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Cộng đồng lớn</CardTitle>
                  <CardDescription>Kết nối với hàng ngàn người chơi thể thao tại Đà Nẵng</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Sẵn sàng chơi thể thao?</h2>
              <p className="mb-8 text-muted-foreground">Tìm sân phù hợp và đặt lịch ngay hôm nay</p>
              <Button size="lg" className="gap-2">
                <Calendar className="h-5 w-5" />
                Bắt đầu đặt sân
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Sport DH. Đồ án Công nghệ Thông tin - Đà Nẵng</p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
