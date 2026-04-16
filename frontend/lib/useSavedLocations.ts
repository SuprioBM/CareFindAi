import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface SavedLocation {
  _id: string;
  label: "home" | "office" | "other";
  customLabel: string;
  address: string;
  latitude: number;
  longitude: number;
}

export function useSavedLocations() {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // GET all
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await apiFetch("/saved-locations");
        const data = await res.json();

        if (data.success) {
          setLocations(data.data);
        }
      } catch (err) {
        console.error("Failed to load saved locations", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  // CREATE
  async function createLocation(payload: Partial<SavedLocation>) {
    const res = await apiFetch("/saved-locations", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    setLocations((prev) => [data.data, ...prev]);
    return data.data;
  }

  // DELETE
  async function deleteLocation(id: string) {
    const res = await apiFetch(`/saved-locations/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    setLocations((prev) => prev.filter((l) => l._id !== id));
  }

  return {
    locations,
    loading,
    createLocation,
    deleteLocation,
  };
}