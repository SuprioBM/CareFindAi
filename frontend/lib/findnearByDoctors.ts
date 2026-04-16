import { apiFetch } from "./api";
import { NearbyDoctorParams } from "@/types/types";


export async function fetchNearbyDoctors(params: NearbyDoctorParams) {
  const query = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    radius: String(params.radius ?? 20),
    specialization: params.specialization,
  });

  const res = await apiFetch(
    `/doctors/nearby/search?${query.toString()}`,
    { method: "GET" }
  );

  const rawText = await res.text();

  let parsed: any = null;

  try {
    parsed = rawText ? JSON.parse(rawText) : null;
  } catch (err) {
    throw new Error("Frontend failed to parse backend response");
  }

  if (!res.ok) {
    throw new Error(parsed?.message || "Failed to fetch nearby doctors");
  }

  // ✅ keep sessionStorage (no change)
  sessionStorage.setItem(
    "carefind_nearby_doctors",
    JSON.stringify({
      userLocation: {
        latitude: params.latitude,
        longitude: params.longitude,
      },
      specialization: params.specialization,
      doctors: parsed?.data ?? [],
    })
  );

  // ✅ ADD THIS
  return parsed?.data ?? [];
}