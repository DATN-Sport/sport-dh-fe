// Utility functions for handling and displaying API errors

export function getErrorMessage(error: unknown): string {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === "string") {
    return error
  }

  // Handle objects with message property
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }

  // Handle network errors
  if (error && typeof error === "object" && "name" in error) {
    const errorName = String(error.name)
    if (errorName === "TypeError" || errorName === "NetworkError") {
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
    }
  }

  // Default fallback
  return "Đã xảy ra lỗi không xác định"
}

export function getErrorTitle(error: unknown): string {
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return "Lỗi kết nối"
    }
    // Check for authentication errors
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return "Lỗi xác thực"
    }
    // Check for permission errors
    if (error.message.includes("403") || error.message.includes("Forbidden")) {
      return "Không có quyền"
    }
    // Check for not found errors
    if (error.message.includes("404") || error.message.includes("Not found")) {
      return "Không tìm thấy"
    }
    // Check for server errors
    if (error.message.includes("500") || error.message.includes("Internal")) {
      return "Lỗi máy chủ"
    }
  }

  return "Lỗi"
}
