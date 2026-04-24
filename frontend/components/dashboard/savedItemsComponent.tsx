/**
 * The system shall allow users to save or bookmark doctors for quick future reference.
 * User shall save frequently used locations (home, office) for quick future searches.
 * The system shall allow users to view detailed doctor profiles from the dashboard.
 *
 * This component renders the full "Saved Items" dashboard section, which contains two sub-sections:
 *
 * 1. SAVED DOCTORS ()
 *    - Fetches all doctors the user has bookmarked from GET /api/bookmarks
 *    - Renders a card grid showing each doctor's photo, name, specialization, and fees
 *    - Each card has a remove (unsave) button and a "Book Appointment" link
 *    - The Book link navigates to /doctors/:id — the full doctor profile page ()
 *
 * 2. SAVED LOCATIONS ()
 *    - Fetches all saved locations (home, office, etc.) from GET /api/saved-locations
 *    - Renders location cards with label, address, and a map directions button
 *    - Clicking "Directions" on a location opens an interactive map with a route preview
 *    - Locations can be removed with the heart/delete button
 */
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/authContext/authContext';

// ── TypeScript Type Definitions ──────────────────────────────────────────────
/**
 * Represents a saved/bookmarked doctor as displayed in the UI.
 * This is the cleaned-up shape we use after transforming the raw API response.
 */
interface BookmarkedDoctor {
  bookmarkId: string;       // Unique ID of the bookmark record (used to delete it)
  doctorId: string;         // The doctor's own ID (used to link to their profile page)
  fullName: string;         // Doctor's display name
  specializationName: string; // e.g., "Cardiology", "Neurology"
  profileImage: string;     // URL to doctor's photo (shown on the card)
  city: string;             // Where the doctor's chamber is located
  fees: number;             // Consultation fee in BDT
  consultation: string;     // Consultation type (e.g., "In-person", "Telemedicine")
}

interface BookmarkApiItem {
  _id: string;
  doctor?: {
    _id?: string;
    fullName?: string;
    specializationName?: string;
    profileImage?: string;
    city?: string;
    fees?: number;
    consultation?: string;
  };
}

interface BookmarkResponse {
  success: boolean;
  data: BookmarkApiItem[];
  message?: string;
}

/**
 * Raw API response shape for a single saved location from GET /api/saved-locations.
 * This is what the backend returns before we transform it for display.
 */
interface SavedLocationApi {
  _id: string;              // Unique MongoDB ID for this saved location
  label: 'home' | 'office' | 'other'; // Category of location
  customLabel: string;      // User-given name (e.g., "Grandma's House")
  address: string;          // Full readable address string
  latitude: number;         // GPS latitude for map placement
  longitude: number;        // GPS longitude for map placement
  image?: string;           // Optional photo of the location
}

/**
 * The transformed shape of a saved location used for rendering UI cards.
 * Created by mapping the raw API data into a format the component can use easily.
 */
interface SavedLocationCard {
  id: number;               // Sequential display index (1, 2, 3...)
  serverId: string;         // MongoDB ID — used for delete API calls
  labelType: 'home' | 'office' | 'other'; // Controls icon and color
  tag: string;              // Short label shown as a badge (e.g., "Home", "Office")
  name: string;             // Display name of this location
  addressLine1: string;     // First line of address (before the first comma)
  addressLine2: string;     // Remaining address (city, district, etc.)
  image: string | null;     // Optional photo URL, null if not available
  lat: number;              // Latitude for map pin
  lng: number;              // Longitude for map pin
}

interface SavedLocationResponse {
  success: boolean;
  data: SavedLocationApi[];
  message?: string;
}

const DoctorMap = dynamic(() => import('../../components/Map/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-surface text-text-muted text-sm">
      Loading map...
    </div>
  ),
});

// Default GPS fallback if the browser cannot get the user's real location
const DEFAULT_USER_LOCATION: [number, number] = [47.6062, -122.3321];

// Fallback photo path if a doctor has no profile image stored
const DEFAULT_PHOTO = '/default-doctor.png';

function mapLocationLabel(label: 'home' | 'office' | 'other'): string {
  if (label === 'home') return 'Home';
  if (label === 'office') return 'Office';
  return 'Other';
}

function splitAddress(address: string): [string, string] {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [parts[0] || address || 'Saved location', ''];
  }

  return [parts[0], parts.slice(1).join(', ')];
}

function getLocationIcon(label: 'home' | 'office' | 'other'): string {
  if (label === 'home') return 'home';
  if (label === 'office') return 'domain';
  return 'place';
}

function buildLocationIconDataUrl(label: 'home' | 'office' | 'other'): string {
  const icon = label === 'home' ? 'H' : label === 'office' ? 'O' : 'L';
  const bg = label === 'home' ? '#0d9488' : label === 'office' ? '#2563eb' : '#64748b';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="18" fill="${bg}"/><circle cx="48" cy="48" r="26" fill="rgba(255,255,255,0.2)"/><text x="48" y="56" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="white" font-weight="700">${icon}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Transforms a raw bookmark API item into the BookmarkedDoctor shape.
 * Handles missing fields gracefully with fallback values so the UI never breaks
 * even if a doctor's data is incomplete.
 */
function mapBookmarkItem(item: BookmarkApiItem): BookmarkedDoctor {
  const doctor = item.doctor;

  return {
    bookmarkId: item._id,                                          // Bookmark record ID (for delete)
    doctorId: doctor?._id || item._id,                            // Doctor's ID (for profile link)
    fullName: doctor?.fullName || 'Unknown Doctor',               // Display name fallback
    specializationName: doctor?.specializationName || 'General Medicine', // Specialty fallback
    profileImage: doctor?.profileImage || DEFAULT_PHOTO,          // Photo fallback
    city: doctor?.city || 'Location unavailable',                 // Location fallback
    fees: doctor?.fees || 0,                                      // Fee fallback (0 = not specified)
    consultation: doctor?.consultation || 'N/A',                  // Consultation type fallback
  };
}

// ── Component ─────────────────────────────────────────────────
export default function SavedItemsContent() {
  const { user, loading } = useAuth();

  // ── Saved Doctors State ────────────────────────────────────────────
  const [doctors, setDoctors] = useState<BookmarkedDoctor[]>([]);         // List of bookmarked doctors
  const [fetching, setFetching] = useState(true);                          // Loading state for bookmarks API
  const [removing, setRemoving] = useState<string | null>(null);           // ID of bookmark currently being removed
  // ── Saved Locations State ──────────────────────────────────────────
  const [savedLocations, setSavedLocations] = useState<SavedLocationCard[]>([]); // List of saved locations
  const [loadingLocations, setLoadingLocations] = useState(true);          // Loading state for locations API
  const [removingLocationId, setRemovingLocationId] = useState<string | null>(null); // ID of location being removed

  // ── Location state (untouched) ────────────────────────────
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_USER_LOCATION);
  const [activeRouteLocationId, setActiveRouteLocationId] = useState<number | null>(null);

  // ── Fetch bookmarked doctors from the backend ──────────────────────
  useEffect(() => {
    if (loading) return; // Wait for auth check to finish first

    if (!user) {
      // User is not logged in — clear the list and stop loading
      setDoctors([]);
      setFetching(false);
      return;
    }

    async function loadBookmarks() {
      try {
        setFetching(true);
        // GET /api/bookmarks — returns all doctors bookmarked by the logged-in user.
        // Each item includes full doctor details (name, photo, city, specialization).
        const res = await apiFetch('/bookmarks');
        const data: BookmarkResponse = await res.json();
        if (!data.success) return;

        // Transform each raw API item into the cleaner BookmarkedDoctor shape for the UI
        setDoctors(data.data.map(mapBookmarkItem));
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      } finally {
        setFetching(false);
      }
    }

    loadBookmarks();
  }, [loading, user]);

  // ── Fetch saved locations from the backend ──────────────────────────
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setSavedLocations([]);
      setLoadingLocations(false);
      return;
    }

    let cancelled = false;

    async function loadSavedLocations() {
      try {
        setLoadingLocations(true);
        const res = await apiFetch('/saved-locations');
        const data: SavedLocationResponse = await res.json();

        if (!data.success) {
          if (!cancelled) setSavedLocations([]);
          return;
        }

        const mapped = data.data.map((location, index) => {
          const [addressLine1, addressLine2] = splitAddress(location.address);
          const tag = location.customLabel?.trim() || mapLocationLabel(location.label);

          return {
            id: index + 1,
            serverId: location._id,
            labelType: location.label,
            tag,
            name: location.customLabel?.trim() || `${mapLocationLabel(location.label)} Location`,
            addressLine1,
            addressLine2,
            image: location.image?.trim() || null,
            lat: location.latitude,
            lng: location.longitude,
          };
        });

        if (!cancelled) {
          setSavedLocations(mapped);
        }
      } catch (e) {
        console.error('Failed to load saved locations:', e);
        if (!cancelled) {
          setSavedLocations([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingLocations(false);
        }
      }
    }

    loadSavedLocations();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  // ── Remove (unsave) a bookmarked doctor ─────────────────────────────
  // Uses "optimistic update" — removes the card from the UI immediately for instant feedback,
  // then calls the API. If the API call fails, it re-fetches the list to restore the correct state.
  const removeBookmark = async (bookmarkId: string) => {
    setRemoving(bookmarkId);
    setDoctors((prev) => prev.filter((d) => d.bookmarkId !== bookmarkId));

    try {
      const res = await apiFetch(`/bookmarks/${bookmarkId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
    } catch (e) {
      console.error('Remove failed, reverting:', e);
      const res = await apiFetch('/bookmarks');
      const data: BookmarkResponse = await res.json();
      if (data.success) {
        setDoctors(data.data.map(mapBookmarkItem));
      }
    } finally {
      setRemoving(null);
    }
  };

  // ── Remove a saved location ──────────────────────────────────────────
  // Also uses optimistic update — removes from UI first, then calls DELETE /api/saved-locations/:id.
  // If the delete fails, the original list is restored from the saved snapshot.
  const removeSavedLocation = async (locationId: string) => {
    setRemovingLocationId(locationId);
    const previous = savedLocations;
    setSavedLocations((prev) => prev.filter((location) => location.serverId !== locationId));

    try {
      const res = await apiFetch(`/saved-locations/${locationId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete saved location');
      }

      setActiveRouteLocationId((prev) => {
        const deletedLocation = previous.find((item) => item.serverId === locationId);
        if (!deletedLocation) return prev;
        return prev === deletedLocation.id ? null : prev;
      });
    } catch (e) {
      console.error('Failed to delete saved location, reverting:', e);
      setSavedLocations(previous);
    } finally {
      setRemovingLocationId(null);
    }
  };

  // ── Get the user's current GPS position for the map ─────────────────
  // This is used to show the user's location on the saved locations map.
  // Falls back to DEFAULT_USER_LOCATION if the browser denies geolocation permission.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setUserLocation(DEFAULT_USER_LOCATION);
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  // ── Map data helpers ─────────────────────────────────────────────────
  // These convert saved location data into the format the <DoctorMap> component expects.
  const mapMarkers = useMemo(
    () =>
      savedLocations.map((location) => ({
        id: location.id,
        name: location.name,
        specialty: location.tag,
        lat: location.lat,
        lng: location.lng,
        photo: location.image || buildLocationIconDataUrl(location.labelType),
        isSelected: activeRouteLocationId === location.id,
      })),
    [activeRouteLocationId, savedLocations],
  );

  const routeTo = useMemo<[number, number] | null>(() => {
    if (!activeRouteLocationId) return null;
    const location = savedLocations.find((item) => item.id === activeRouteLocationId);
    return location ? [location.lat, location.lng] : null;
  }, [activeRouteLocationId, savedLocations]);

  const activeLocation = useMemo(
    () => savedLocations.find((item) => item.id === activeRouteLocationId) ?? null,
    [activeRouteLocationId, savedLocations],
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-text-base">Saved Items</h1>
        <p className="text-text-muted text-base">
          Manage your preferred healthcare professionals and facilities.
        </p>
      </div>

      {/* ── Saved Doctors Section ─────────────────────────────────
           Shows all doctors the user has bookmarked.
           Each card displays: photo, name, specialization, rating placeholder, and a
           "Book Appointment" button that links to the full doctor profile page ().
           The heart button removes the doctor from the saved list.
      ── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">stethoscope</span>
            <h2 className="text-2xl font-bold text-text-base">Saved Doctors</h2>
          </div>
          {!fetching && (
            <span className="bg-card text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
              {doctors.length} Saved
            </span>
          )}
        </div>

        {/* loading skeletons */}
        {fetching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-sm animate-pulse"
              >
                <div className="w-full aspect-4/3 bg-border" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 bg-border rounded w-3/4" />
                  <div className="h-3 bg-border rounded w-1/2" />
                  <div className="h-9 bg-border rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {!fetching && doctors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-text-muted border border-dashed border-border rounded-xl">
            <span className="material-symbols-outlined text-5xl text-primary/30">favorite</span>
            <p className="text-base font-medium">No saved doctors yet</p>
            <Link href="/symptoms" className="text-sm text-primary font-semibold hover:underline">
              Find doctors near you →
            </Link>
          </div>
        )}

        {/* doctor cards */}
        {!fetching && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <article
                key={doctor.bookmarkId}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div
                  className="w-full aspect-4/3 bg-center bg-no-repeat bg-cover relative"
                  style={{
                    backgroundImage: `url('${doctor.profileImage}')`,
                    backgroundColor: 'var(--color-border)',
                  }}
                >
                  <button
                    onClick={() => removeBookmark(doctor.bookmarkId)}
                    disabled={removing === doctor.bookmarkId}
                    className="absolute top-3 right-3 size-8 bg-card/90 rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform shadow-sm disabled:opacity-50"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-base mb-1">{doctor.fullName}</h3>
                    <p className="text-text-muted text-sm font-medium">{doctor.specializationName}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="material-symbols-outlined text-yellow-400 text-[18px]">star</span>
                    <span className="text-text-base">—</span>
                    <span className="text-text-muted ml-1">No ratings yet</span>
                  </div>

                  <Link
                    href={`/doctors/${doctor.doctorId}`}
                    className="w-full py-2.5 bg-surface text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-colors mt-2 text-sm text-center"
                  >
                    Book Appointment
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Saved Locations Section ────────────────────────────────────────
           Shows all locations the user has saved (home, office, or custom).
           Each card shows: label badge (Home/Office/Other), address, and action buttons.
           "Directions" button activates a map route preview below the cards list.
           The heart button permanently removes the location from the saved list.
      ── */}
      <section className="flex flex-col gap-6 bg-card p-8 rounded-2xl border border-border">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
            <h2 className="text-2xl font-bold text-text-base">Saved Locations</h2>
          </div>
          <span className="bg-surface text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
            {savedLocations.length} Saved
          </span>
        </div>

        {loadingLocations && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={`saved-location-skeleton-${i}`}
                className="h-56 animate-pulse rounded-xl border border-border bg-surface"
              />
            ))}
          </div>
        )}

        {!loadingLocations && savedLocations.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center text-text-muted">
            <span className="material-symbols-outlined text-4xl text-primary/40">location_on</span>
            <p className="mt-3 text-sm font-medium">No saved locations yet</p>
            <p className="mt-1 text-xs">Save locations from the doctor finder to see them here.</p>
          </div>
        )}

        {!loadingLocations && savedLocations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedLocations.map((location) => {
            const isRouting = activeRouteLocationId === location.id;

            return (
              <article
                key={location.serverId}
                className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-full sm:w-2/5 h-48 sm:h-auto relative ${
                    location.image
                        ? 'bg-center bg-no-repeat bg-cover'
                        : 'bg-linear-to-br from-primary/15 via-primary/10 to-secondary/10'
                  }`}
                  style={location.image ? { backgroundImage: `url('${location.image}')` } : undefined}
                >
                  {!location.image && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-5xl">
                        {getLocationIcon(location.labelType)}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-text-sub">
                        {mapLocationLabel(location.labelType)}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeSavedLocation(location.serverId)}
                    disabled={removingLocationId === location.serverId}
                    className="absolute top-3 right-3 size-8 bg-card/90 rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform shadow-sm disabled:opacity-50 sm:hidden"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between relative">
                  <button
                    type="button"
                    onClick={() => removeSavedLocation(location.serverId)}
                    disabled={removingLocationId === location.serverId}
                    className="absolute top-4 right-4 size-8 bg-card rounded-full hidden items-center justify-center text-error hover:scale-110 transition-transform disabled:opacity-50 sm:flex"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {location.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-base mb-2">{location.name}</h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-4">
                      {location.addressLine1}
                      <br />
                      {location.addressLine2}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveRouteLocationId(location.id)}
                      className={`flex-1 py-2 font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                        isRouting ? 'bg-primary-hover text-white' : 'bg-primary text-white hover:bg-primary-hover'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{isRouting ? 'route' : 'directions'}</span>
                      {isRouting ? 'Route Active' : 'Directions'}
                    </button>
                    <button type="button" className="px-4 py-2 bg-card text-text-base font-semibold rounded-lg border border-border hover:border-primary transition-colors text-sm">
                      Details
                    </button>
                  </div>
                </div>
              </article>
            );
            })}
          </div>
        )}

        {activeLocation && (
          <section className="mt-2 bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1">Directions Preview</p>
                <p className="text-sm text-text-base font-semibold">{activeLocation.name}</p>
              </div>
              <button
                onClick={() => setActiveRouteLocationId(null)}
                className="h-9 px-3 rounded-lg border border-border text-text-sub hover:text-error hover:border-error/40 transition-colors text-sm font-medium"
              >
                Close Route
              </button>
            </div>

            <div className="h-90 w-full">
              <DoctorMap
                userLocation={userLocation}
                doctors={mapMarkers}
                onDoctorClick={(id) => setActiveRouteLocationId(id)}
                routeTo={routeTo}
                onClearRoute={() => setActiveRouteLocationId(null)}
              />
            </div>
          </section>
        )}
      </section>
    </div>
  );
}