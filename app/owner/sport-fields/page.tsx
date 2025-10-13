"use client"

import type React from "react"

import { OwnerRoute } from "@/components/owner-route"
import { OwnerSidebar } from "@/components/owner-sidebar"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Images } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient, type SportField, type SportCenter } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ImageGalleryManager } from "@/components/image-gallery-manager"
import { getErrorMessage } from "@/lib/error-handler"

export default function OwnerSportFieldsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sportFields, setSportFields] = useState<SportField[]>([])
  const [sportCenters, setSportCenters] = useState<SportCenter[]>([])
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<SportField | null>(null)
  const [managingImagesField, setManagingImagesField] = useState<SportField | null>(null)
  const [formData, setFormData] = useState({
    sport_center: "",
    name: "",
    sport_type: "FOOTBALL" as SportField["sport_type"],
    price: 0,
    status: "ACTIVE" as SportField["status"],
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const fetchSportCenters = async () => {
    if (!user?.id) return

    try {
      const data = await apiClient.getAllSportCenters({ owner: user.id })
      setSportCenters(data)
      if (data.length > 0 && !selectedCenter) {
        setSelectedCenter(data[0].id)
      }
    } catch (error) {
      const { title, description } = getErrorMessage(error, "Không thể tải danh sách trung tâm thể thao")
      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  const fetchSportFields = async () => {
    if (!selectedCenter) return

    try {
      const data = await apiClient.getAllSportFields({ sport_center: selectedCenter })
      setSportFields(data)
    } catch (error) {
      const { title, description } = getErrorMessage(error, "Không thể tải danh sách sân thể thao")
      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchSportCenters()
  }, [user])

  useEffect(() => {
    if (selectedCenter) {
      fetchSportFields()
    }
  }, [selectedCenter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingField) {
        const updateFormData = new FormData()
        updateFormData.append("name", formData.name)
        updateFormData.append("sport_type", formData.sport_type)
        updateFormData.append("price", formData.price.toString())
        updateFormData.append("status", formData.status)

        imageFiles.forEach((file) => {
          updateFormData.append("images", file)
        })

        await apiClient.updateSportField(editingField.id, updateFormData)
        toast({
          title: "Thành công",
          description: "Cập nhật sân thể thao thành công",
        })
      } else {
        const createFormData = new FormData()
        createFormData.append("sport_center", formData.sport_center)
        createFormData.append("name", formData.name)
        createFormData.append("sport_type", formData.sport_type)
        createFormData.append("price", formData.price.toString())
        createFormData.append("status", formData.status)

        imageFiles.forEach((file) => {
          createFormData.append("images", file)
        })

        await apiClient.createSportField(createFormData)
        toast({
          title: "Thành công",
          description: "Tạo sân thể thao thành công",
        })
      }
      setIsDialogOpen(false)
      setEditingField(null)
      setFormData({
        sport_center: "",
        name: "",
        sport_type: "FOOTBALL",
        price: 0,
        status: "ACTIVE",
      })
      setImageFiles([])
      fetchSportFields()
    } catch (error) {
      const { title, description } = getErrorMessage(
        error,
        editingField ? "Không thể cập nhật sân thể thao" : "Không thể tạo sân thể thao",
      )
      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (field: SportField) => {
    setEditingField(field)
    setFormData({
      sport_center: field.sport_center.toString(),
      name: field.name,
      sport_type: field.sport_type,
      price: field.price,
      status: field.status,
    })
    setImageFiles([])
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sân thể thao này?")) return

    try {
      await apiClient.deleteSportField(id)
      toast({
        title: "Thành công",
        description: "Xóa sân thể thao thành công",
      })
      fetchSportFields()
    } catch (error) {
      const { title, description } = getErrorMessage(error, "Không thể xóa sân thể thao")
      toast({
        title,
        description,
        variant: "destructive",
      })
    }
  }

  const handleCreate = () => {
    setEditingField(null)
    setFormData({
      sport_center: selectedCenter?.toString() || "",
      name: "",
      sport_type: "FOOTBALL",
      price: 0,
      status: "ACTIVE",
    })
    setImageFiles([])
    setIsDialogOpen(true)
  }

  const handleManageImages = (field: SportField) => {
    setManagingImagesField(field)
    setIsImageDialogOpen(true)
  }

  const handlePriceChange = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      price: Math.max(0, prev.price + delta),
    }))
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
                <h1 className="text-3xl font-bold text-foreground">Sân thể thao</h1>
                <p className="text-muted-foreground">Quản lý sân thể thao của bạn</p>
              </div>
              <div className="flex gap-4">
                <Select value={selectedCenter?.toString()} onValueChange={(value) => setSelectedCenter(Number(value))}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Chọn trung tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id.toString()}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCreate} className="gap-2" disabled={!selectedCenter}>
                  <Plus className="h-4 w-4" />
                  Thêm sân
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sportFields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.id}</TableCell>
                      <TableCell className="font-medium">{field.name}</TableCell>
                      <TableCell>{field.sport_type}</TableCell>
                      <TableCell>{field.price.toLocaleString("vi-VN")}đ</TableCell>
                      <TableCell>{field.status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleManageImages(field)}>
                            <Images className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(field)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(field.id)}>
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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingField ? "Chỉnh sửa sân thể thao" : "Thêm sân thể thao"}</DialogTitle>
                  <DialogDescription>
                    {editingField ? "Cập nhật thông tin sân thể thao" : "Tạo sân thể thao mới"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sport_center">Trung tâm</Label>
                      <Select
                        value={formData.sport_center}
                        onValueChange={(value) => setFormData({ ...formData, sport_center: value })}
                        disabled={!!editingField}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trung tâm" />
                        </SelectTrigger>
                        <SelectContent>
                          {sportCenters.map((center) => (
                            <SelectItem key={center.id} value={center.id.toString()}>
                              {center.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Tên sân</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sport_type">Loại sân</Label>
                      <Select
                        value={formData.sport_type}
                        onValueChange={(value: SportField["sport_type"]) =>
                          setFormData({ ...formData, sport_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FOOTBALL">Bóng đá</SelectItem>
                          <SelectItem value="BADMINTON">Cầu lông</SelectItem>
                          <SelectItem value="TENNIS">Quần vợt</SelectItem>
                          <SelectItem value="BASKETBALL">Bóng rổ</SelectItem>
                          <SelectItem value="VOLLEYBALL">Bóng chuyền</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Giá (VNĐ)</Label>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => handlePriceChange(-10000)}>
                          -10,000
                        </Button>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          required
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={() => handlePriceChange(10000)}>
                          +10,000
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: SportField["status"]) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                          <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="images">Hình ảnh</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                      />
                      {imageFiles.length > 0 && (
                        <p className="text-sm text-muted-foreground">Đã chọn {imageFiles.length} ảnh</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingField ? "Cập nhật" : "Tạo mới"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Quản lý hình ảnh - {managingImagesField?.name}</DialogTitle>
                  <DialogDescription>Thêm hoặc xóa hình ảnh cho sân thể thao</DialogDescription>
                </DialogHeader>
                {managingImagesField && (
                  <ImageGalleryManager
                    sportFieldId={managingImagesField.id}
                    images={managingImagesField.images}
                    onImagesChange={fetchSportFields}
                  />
                )}
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </OwnerRoute>
  )
}
