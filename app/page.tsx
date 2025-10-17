"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Trophy, Users, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />

        <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20 py-24 md:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 text-balance text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
                Đặt sân thể thao dễ dàng tại{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Đà Nẵng
                </span>
              </h1>
              <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl">
                Tìm và đặt sân bóng đá, cầu lông, tennis và nhiều môn thể thao khác chỉ với vài cú click
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="h-14 gap-2 px-8 text-lg font-bold" asChild>
                  <Link href="/booking">
                    <Calendar className="h-5 w-5" />
                    Đặt sân ngay
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 gap-2 border-2 px-8 text-lg font-bold bg-transparent"
                  asChild
                >
                  <Link href="/sport-centers">
                    <MapPin className="h-5 w-5" />
                    Xem trung tâm
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold">Tại sao chọn Sport DH?</h2>
              <p className="text-lg text-muted-foreground">Nền tảng đặt sân thể thao hàng đầu tại Đà Nẵng</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group border-2 transition-all hover:border-primary hover:shadow-xl hover:shadow-primary/20">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Đặt sân nhanh chóng</CardTitle>
                  <CardDescription className="text-base">
                    Đặt sân chỉ trong vài phút với giao diện đơn giản, dễ sử dụng
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-2 transition-all hover:border-secondary hover:shadow-xl hover:shadow-secondary/20">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/60">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Nhiều địa điểm</CardTitle>
                  <CardDescription className="text-base">
                    Hơn 50+ sân thể thao chất lượng cao trên khắp Đà Nẵng
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-2 transition-all hover:border-accent hover:shadow-xl hover:shadow-accent/20">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/60">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Giá cả hợp lý</CardTitle>
                  <CardDescription className="text-base">
                    Giá cả minh bạch, nhiều ưu đãi và chương trình khuyến mãi
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-2 transition-all hover:border-primary hover:shadow-xl hover:shadow-primary/20">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Cộng đồng lớn</CardTitle>
                  <CardDescription className="text-base">
                    Kết nối với hàng ngàn người chơi thể thao tại Đà Nẵng
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-2 transition-all hover:border-secondary hover:shadow-xl hover:shadow-secondary/20">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/60">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Chất lượng đảm bảo</CardTitle>
                  <CardDescription className="text-base">
                    Tất cả sân đều được kiểm duyệt và đánh giá bởi cộng đồng
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-2 transition-all hover:border-accent hover:shadow-xl hover:shadow-accent/20">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/60">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Quản lý dễ dàng</CardTitle>
                  <CardDescription className="text-base">
                    Theo dõi lịch đặt sân và quản lý booking một cách tiện lợi
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent py-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Sẵn sàng chơi thể thao?</h2>
              <p className="mb-10 text-lg text-white/90 md:text-xl">Tìm sân phù hợp và đặt lịch ngay hôm nay</p>
              <Button size="lg" variant="secondary" className="h-14 gap-2 px-8 text-lg font-bold" asChild>
                <Link href="/booking">
                  <Calendar className="h-5 w-5" />
                  Bắt đầu tìm sân
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Sport DH. Đồ án Công nghệ Thông tin - Đà Nẵng</p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
