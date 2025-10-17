"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ImageIcon, Trash2, Upload, X } from "lucide-react"
import { apiClient, type SportCenterImage, type SportFieldImage } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage, getErrorTitle } from "@/lib/error-handler"

interface ImageGalleryManagerProps {
  images: (SportCenterImage | SportFieldImage)[]
  onImagesChange: () => void
  entityType: "sport_center" | "sport_field"
  entityId: number
}

export function ImageGalleryManager({ images, onImagesChange, entityType, entityId }: ImageGalleryManagerProps) {
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { toast } = useToast()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8888/api"
  const API_MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_API_URL || "http://127.0.0.1:8888/media"

  const getImageUrl = (file: string) => {
    if (file.startsWith("http")) return file
    return `${API_MEDIA_BASE_URL}/${file}`
  }
  

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return

    setDeleting(imageId)
    try {
      // If deleteImage completes without throwing, it was successful
      await apiClient.deleteImage(imageId)

      toast({
        title: "Thành công",
        description: "Đã xóa ảnh thành công",
      })

      // Refresh the parent component to update the images list
      onImagesChange()
    } catch (error) {
      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const formData = new FormData()

    Array.from(files).forEach((file) => {
      formData.append("images", file)
    })

    try {
      if (entityType === "sport_center") {
        await apiClient.updateSportCenter(entityId, formData as any)
      } else {
        await apiClient.updateSportField(entityId, formData as any)
      }
      toast({
        title: "Thành công",
        description: "Đã tải lên ảnh mới",
      })
      onImagesChange()
    } catch (error) {
      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ImageIcon className="h-4 w-4" />
            Quản lý ảnh ({images.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quản lý hình ảnh</DialogTitle>
            <DialogDescription>Xem, thêm hoặc xóa hình ảnh</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Button */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Tải lên ảnh mới
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImages}
                  />
                </label>
              </Button>
            </div>

            {/* Image Grid */}
            {images.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Chưa có ảnh nào</p>
                </div>
              </div>
            ) : (
              <div className="grid max-h-96 grid-cols-3 gap-4 overflow-y-auto">
                {images.map((image) => (
                  <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                    <img
                      src={getImageUrl(image.file) || "/placeholder.svg"}
                      alt={`Image ${image.id}`}
                      className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                      onClick={() => setSelectedImage(getImageUrl(image.file))}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deleting === image.id}
                    >
                      {deleting === image.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setSelectedImage(null)}>
            <X className="h-4 w-4" />
          </Button>
          {selectedImage && (
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Full size preview"
              className="h-auto w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
