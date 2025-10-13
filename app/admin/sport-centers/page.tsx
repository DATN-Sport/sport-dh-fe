"use client"

import type React from "react"

import { AdminRoute } from "@/components/admin-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient, type SportCenter, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ImageGalleryManager } from "@/components/image-gallery-manager"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage, getErrorTitle } from "@/lib/error-handler"

export default function AdminSportCentersPage() {
  const [centers, setCenters] = useState<SportCenter[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCenter, setEditingCenter] = useState<SportCenter | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    owner: "",
    name: "",
    address: "",
  })

  useEffect(() => {
    fetchCenters()
    fetchUsers()
  }, [])

  const fetchCenters = async () => {
    try {
      const data = await apiClient.getAllSportCenters()
      setCenters(data)
    } catch (error) {
      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await apiClient.getAllUsers()
      // Filter to show only OWNER role users
      setUsers(data.filter((user) => user.role === "OWNER"))
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const handleEdit = (center: SportCenter) => {
    setEditingCenter(center)
    setFormData({
      owner: center.owner,
      name: center.name,
      address: center.address,
    })
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingCenter(null)
    setFormData({
      owner: users[0]?.id || "",
      name: "",
      address: "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trung tâm này?")) return

    try {
      await apiClient.deleteSportCenter(id)
      toast({
        title: "Thành công",
        description: "Đã xóa trung tâm thể thao",
      })
      fetchCenters()
    } catch (error) {
      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCenter) {
        await apiClient.updateSportCenter(editingCenter.id, formData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật trung tâm",
        })
      } else {
        await apiClient.createSportCenter(formData)
        toast({
          title: "Thành công",
          description: "Đã thêm trung tâm mới",
        })
      }
      setDialogOpen(false)
      setEditingCenter(null)
      fetchCenters()
    } catch (error) {
      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }

  const getOwnerName = (ownerId: string) => {
    const owner = users.find((u) => u.id === ownerId)
    return owner ? owner.full_name : ownerId
  }

  return (
    <AdminRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Quản lý trung tâm thể thao</h1>
                <p className="text-muted-foreground">Quản lý các trung tâm thể thao trong hệ thống</p>
              </div>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm trung tâm
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {centers.map((center) => (
                  <Card key={center.id}>
                    <CardHeader>
                      <CardTitle>{center.name}</CardTitle>
                      <CardDescription>{center.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Chủ sở hữu: {getOwnerName(center.owner)}</p>
                        <p className="text-sm text-muted-foreground">Số lượng ảnh: {center.images.length}</p>
                        <p className="text-sm text-muted-foreground">
                          Ngày tạo: {new Date(center.created_at).toLocaleDateString("vi-VN")}
                        </p>
                        <div className="flex gap-2 pt-2">
                          <ImageGalleryManager
                            images={center.images}
                            onImagesChange={fetchCenters}
                            entityType="sport_center"
                            entityId={center.id}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(center)} className="flex-1">
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(center.id)}
                            className="flex-1"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCenter ? "Chỉnh sửa trung tâm" : "Thêm trung tâm"}</DialogTitle>
            <DialogDescription>
              {editingCenter ? "Cập nhật thông tin trung tâm" : "Tạo trung tâm thể thao mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Chủ sở hữu</Label>
                <Select value={formData.owner} onValueChange={(value) => setFormData({ ...formData, owner: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ sở hữu" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Tên trung tâm</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminRoute>
  )
}
