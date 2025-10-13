"use client"

import type React from "react"

import { OwnerRoute } from "@/components/owner-route"
import { OwnerSidebar } from "@/components/owner-sidebar"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient, type SportCenter } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getErrorMessage } from "@/lib/error-handler"

export default function OwnerSportCentersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sportCenters, setSportCenters] = useState<SportCenter[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCenter, setEditingCenter] = useState<SportCenter | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  })

  const fetchData = async () => {
    if (!user?.id) return

    try {
      const data = await apiClient.getAllSportCenters({ owner: user.id })
      setSportCenters(data)
    } catch (error) {
      const { title, description } = getErrorMessage(error, "Không thể tải danh sách trung tâm thể thao")
      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      if (editingCenter) {
        await apiClient.updateSportCenter(editingCenter.id, formData)
        toast({
          title: "Thành công",
          description: "Cập nhật trung tâm thể thao thành công",
        })
      } else {
        await apiClient.createSportCenter({
          ...formData,
          owner: user.id,
        })
        toast({
          title: "Thành công",
          description: "Tạo trung tâm thể thao thành công",
        })
      }
      setIsDialogOpen(false)
      setEditingCenter(null)
      setFormData({ name: "", address: "" })
      fetchData()
    } catch (error) {
      const { title, description } = getErrorMessage(
        error,
        editingCenter ? "Không thể cập nhật trung tâm thể thao" : "Không thể tạo trung tâm thể thao",
      )
      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (center: SportCenter) => {
    setEditingCenter(center)
    setFormData({
      name: center.name,
      address: center.address,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trung tâm thể thao này?")) return

    try {
      await apiClient.deleteSportCenter(id)
      toast({
        title: "Thành công",
        description: "Xóa trung tâm thể thao thành công",
      })
      fetchData()
    } catch (error) {
      const { title, description } = getErrorMessage(error, "Không thể xóa trung tâm thể thao")
      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  const handleCreate = () => {
    setEditingCenter(null)
    setFormData({ name: "", address: "" })
    setIsDialogOpen(true)
  }

  return (
    <OwnerRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <OwnerSidebar />
          <main className="flex-1 p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Trung tâm thể thao</h1>
                <p className="text-muted-foreground">Quản lý trung tâm thể thao của bạn</p>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm trung tâm
              </Button>
            </div>

            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sportCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell>{center.id}</TableCell>
                      <TableCell className="font-medium">{center.name}</TableCell>
                      <TableCell>{center.address}</TableCell>
                      <TableCell>{new Date(center.created_at).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(center)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(center.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCenter ? "Chỉnh sửa trung tâm thể thao" : "Thêm trung tâm thể thao"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCenter ? "Cập nhật thông tin trung tâm thể thao" : "Tạo trung tâm thể thao mới"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Tên trung tâm</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingCenter ? "Cập nhật" : "Tạo mới"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </OwnerRoute>
  )
}
