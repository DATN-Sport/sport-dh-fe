"use client"

import type React from "react"

import { AdminRoute } from "@/components/admin-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Upload, X, ChevronDown, SlidersHorizontal, Images } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient, type SportField, type SportCenter } from "@/lib/api"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage, getErrorTitle } from "@/lib/error-handler"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

const sportTypes = [
  { value: "FOOTBALL", label: "Bóng đá" },
  { value: "BADMINTON", label: "Cầu lông" },
  { value: "TENNIS", label: "Tennis" },
  { value: "PICK_A_BALL", label: "Pick a ball" },
]

const DISTRICTS = ["Hải Châu", "Thanh Khê", "Cẩm Lệ", "Ngũ Hành Sơn", "Liên Chiểu", "Sơn Trà", "Hòa Vang"]

export default function AdminSportFieldsPage() {
  const [fields, setFields] = useState<SportField[]>([])
  const [centers, setCenters] = useState<SportCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<SportField | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const { toast } = useToast()

  // filters giống trang khách
  const [centerNameFilter, setCenterNameFilter] = useState("")
  const [sportTypeFilter, setSportTypeFilter] = useState("")
  const [addressFilter, setAddressFilter] = useState("")
  const [districtPopoverOpen, setDistrictPopoverOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState<number>(500000)

  const [formData, setFormData] = useState({
    name: "",
    sport_center: 0,
    sport_type: "FOOTBALL" as SportField["sport_type"],
    price: 0,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [fieldsData, centersData] = await Promise.all([
        apiClient.getAllSportFields({
          center_name: centerNameFilter.trim() || undefined,
          sport_type: sportTypeFilter || undefined,
          address: addressFilter.trim() || undefined,
          price_lte: maxPrice || undefined,
        }),
        apiClient.getAllSportCenters(),
      ])
      setFields(fieldsData)
      setCenters(centersData)
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

  const handleSearch = () => {
    setLoading(true)
    fetchData()
  }

  const handleDistrictSelect = (district: string) => {
    setAddressFilter(district)
    setDistrictPopoverOpen(false)
  }

  const handleEdit = (field: SportField) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      sport_center: field.sport_center,
      sport_type: field.sport_type,
      price: field.price,
      status: field.status,
    })
    setImageFiles([])
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingField(null)
    setFormData({
      name: "",
      sport_center: centers[0]?.id || 0,
      sport_type: "FOOTBALL",
      price: 0,
      status: "ACTIVE",
    })
    setImageFiles([])
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sân này?")) return

    try {
      await apiClient.deleteSportField(id)
      toast({
        title: "Thành công",
        description: "Đã xóa sân thể thao",
      })
      fetchData()
    } catch (error) {
      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const incrementPrice = () => {
    setFormData({ ...formData, price: formData.price + 10000 })
  }

  const decrementPrice = () => {
    setFormData({ ...formData, price: Math.max(0, formData.price - 10000) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingField) {
        await apiClient.updateSportField(editingField.id, formData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật sân",
        })
      } else {
        const formDataWithImages = new FormData()
        formDataWithImages.append("sport_center", formData.sport_center.toString())
        formDataWithImages.append("name", formData.name)
        formDataWithImages.append("price", formData.price.toString())
        formDataWithImages.append("sport_type", formData.sport_type)
        formDataWithImages.append("status", formData.status)

        // Append all image files
        imageFiles.forEach((file) => {
          formDataWithImages.append("images", file)
        })

        await apiClient.createSportField(formDataWithImages as any)
        toast({
          title: "Thành công",
          description: "Đã thêm sân mới",
        })
      }
      setDialogOpen(false)
      setEditingField(null)
      setImageFiles([])
      fetchData()
    } catch (error) {
      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }

  const getCenterName = (field: SportField) => {
    // If center_info is available in the new API response, use it
    if (field.center_info) {
      return field.center_info.name
    }
    // Otherwise, look up from centers array (old behavior)
    return centers.find((c) => c.id === field.sport_center)?.name || "N/A"
  }

  const getSportTypeLabel = (type: string) => {
    return sportTypes.find((t) => t.value === type)?.label || type
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
                <h1 className="text-3xl font-bold text-foreground">Quản lý sân thể thao</h1>
                <p className="text-muted-foreground">Quản lý các sân thể thao trong hệ thống</p>
              </div>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm sân
              </Button>
            </div>

            {/* Filters giống trang khách (rút gọn) */}
            <Card className="mb-6 border-border/60 bg-card/80">
              <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-4 md:items-end">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tên trung tâm</Label>
                    <Input
                      placeholder="Nhập tên trung tâm..."
                      value={centerNameFilter}
                      onChange={(e) => setCenterNameFilter(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Loại sân</Label>
                    <Select
                      value={sportTypeFilter || undefined}
                      onValueChange={(value) => setSportTypeFilter(value || "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả loại sân" />
                      </SelectTrigger>
                      <SelectContent>
                        {sportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Địa chỉ</Label>
                    <div className="relative">
                      <Input
                        placeholder="Nhập địa chỉ hoặc chọn quận..."
                        value={addressFilter}
                        onChange={(e) => setAddressFilter(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pr-10"
                      />
                      <Popover open={districtPopoverOpen} onOpenChange={setDistrictPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="end">
                          <div className="p-1">
                            {DISTRICTS.map((district) => (
                              <button
                                key={district}
                                type="button"
                                onClick={() => handleDistrictSelect(district)}
                                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                {district}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Giá tối đa: {maxPrice.toLocaleString("vi-VN")}đ
                    </Label>
                    <Slider
                      value={[maxPrice]}
                      onValueChange={(value) => setMaxPrice(value[0])}
                      min={50000}
                      max={500000}
                      step={10000}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Bộ lọc đang áp dụng cho danh sách sân trong bảng bên dưới.</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCenterNameFilter("")
                        setSportTypeFilter("")
                        setAddressFilter("")
                        setMaxPrice(500000)
                        fetchData()
                      }}
                    >
                      Làm mới
                    </Button>
                    <Button onClick={handleSearch}>Tìm kiếm</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border/60 bg-card/80">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên sân</TableHead>
                      <TableHead>Trung tâm</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-center">Ảnh</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell>{field.id}</TableCell>
                        <TableCell className="font-medium">{field.name}</TableCell>
                        <TableCell>{getCenterName(field)}</TableCell>
                        <TableCell>{getSportTypeLabel(field.sport_type)}</TableCell>
                        <TableCell>{field.price.toLocaleString("vi-VN")} đ</TableCell>
                        <TableCell>
                          <Badge variant={field.status === "ACTIVE" ? "default" : "secondary"}>
                            {field.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="Quản lý hình ảnh"
                            >
                              <Images className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground">{field.images.length}</span>
                          </div>
                          <ImageGalleryManager
                            images={field.images}
                            onImagesChange={fetchData}
                            entityType="sport_field"
                            entityId={field.id}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(field)}>
                              <Pencil className="mr-1 h-4 w-4" />
                              Sửa
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(field.id)}>
                              <Trash2 className="mr-1 h-4 w-4" />
                              Xóa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingField ? "Chỉnh sửa sân" : "Thêm sân"}</DialogTitle>
            <DialogDescription>{editingField ? "Cập nhật thông tin sân" : "Tạo sân thể thao mới"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sân</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sport_center">Trung tâm</Label>
                <Select
                  value={formData.sport_center.toString()}
                  onValueChange={(value) => setFormData({ ...formData, sport_center: Number.parseInt(value) })}
                  disabled={!!editingField}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id.toString()}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sport_type">Loại sân</Label>
                <Select
                  value={formData.sport_type}
                  onValueChange={(value: SportField["sport_type"]) => setFormData({ ...formData, sport_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VNĐ)</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={decrementPrice}>
                    -
                  </Button>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) || 0 })}
                    className="flex-1"
                    required
                  />
                  <Button type="button" variant="outline" onClick={incrementPrice}>
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Nút +/- thay đổi 10.000đ mỗi lần</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "ACTIVE" | "INACTIVE") => setFormData({ ...formData, status: value })}
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
              {!editingField && (
                <div className="space-y-2">
                  <Label htmlFor="images">Hình ảnh sân</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("images")?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Chọn hình ảnh
                      </Button>
                    </div>
                    {imageFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Đã chọn {imageFiles.length} hình ảnh</p>
                        <div className="grid grid-cols-2 gap-2">
                          {imageFiles.map((file, index) => (
                            <div key={index} className="relative rounded-lg border p-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
