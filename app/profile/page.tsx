"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    address: user?.address || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const updatedUser = await apiClient.updateUserProfile(user.id, formData)
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật thông tin",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Thông tin cá nhân</h1>
              <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
            </div>

            <div className="grid gap-6">
              {/* Profile Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan</CardTitle>
                  <CardDescription>Thông tin cơ bản về tài khoản</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar || undefined} alt={user.full_name} />
                      <AvatarFallback className="text-2xl">
                        {user.full_name?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{user.full_name || user.username}</h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                        </Badge>
                        {user.is_active && <Badge variant="outline">Đang hoạt động</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Profile Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Chỉnh sửa thông tin</CardTitle>
                  <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="username">Tên đăng nhập</Label>
                        <Input id="username" value={user.username} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Họ và tên</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Nhập địa chỉ của bạn"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading} className="gap-2">
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài khoản</CardTitle>
                  <CardDescription>Chi tiết về tài khoản của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">ID tài khoản</span>
                    <span className="text-sm font-mono">{user.id}</span>
                  </div>
                  {user.created_at && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-muted-foreground">Ngày tạo</span>
                      <span className="text-sm">{new Date(user.created_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  )}
                  {user.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cập nhật lần cuối</span>
                      <span className="text-sm">{new Date(user.updated_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
