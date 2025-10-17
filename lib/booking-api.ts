import { apiClient } from "./api"

export type {
  Booking,
  BookingListResponse,
  BookingMiniListResponse,
  BookingMini,
  RentalSlot,
  RentalSlotListResponse,
  BookingUser,
  BookingSportField,
  BookingRentalSlot,
} from "./api"

// Get rental slots
export async function getRentalSlots(params?: {
  name?: string
  time_slot?: string
  limit?: number
  offset?: number
  ordering?: string
}) {
  return apiClient.getRentalSlots(params)
}

export async function getBookings(params?: {
  sport_field?: number
  rental_slot?: number
  booking_date_?: string
  booking_date_after?: string
  booking_date_before?: string
  month?: number
  year?: number
  status?: string
  limit?: number
  offset?: number
  ordering?: string
}) {
  return apiClient.getBookingsMini(params)
}

// Get booking detail
export async function getBookingDetail(id: number) {
  return apiClient.getBookingDetail(id)
}

// Update booking (book or cancel)
export async function updateBooking(id: number, data: { status: "PENDING" | "CONFIRMED" }) {
  return apiClient.updateBooking(id, data)
}
