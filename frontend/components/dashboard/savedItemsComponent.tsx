'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SavedDoctor, SavedLocation } from '@/types/types';


const savedDoctorsMock: SavedDoctor[] = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    specialty: 'Cardiologist',
    rating: '4.9',
    reviews: 120,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB0qhlNQI6mO3c0A0RRS-iE7knzmt35O3Uye46CIsm3Qst-orrU7CMGbp17hjtFmmHcAswN-xe5IF4x5RG4iS10VX-lfr6r6yS9aLO7eWK9yli8lDDUZDYfhFQNsMkRq5JZgnCFGBWvUfjoUHB7aCV-4MIv9K9MerhjLBXQZM8SCrnxQNfIfEY0ZrjlFCFpuTXUBL69H9MXfeCCS4LbjpFlQNOzXcMdlc2pL_v1podyhZ7abXoCe4JEEZqqbsnBknGdLSkuOWHzNO8',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    rating: '4.8',
    reviews: 85,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB32iYRmK_SWEkt1JtNE7XvujqZRXCGvb0Zu_Rm4jHLEiXDErYMNE2v0u-x2lx7aofrN__uJTTklx-G383vWbYjvrx4Yd7yv3HqilBashV2k95akax1qGwGHzLNnqKTRyfM0lhAzUn7NhdhMOyGjixVsyAlsERInekzAU2vaQQMyfqmWAqh5N2VwEPVtFgIs6HYFSlWeWMWAQ48jiiPPlk55f7Rc9BuvZOwQd9qaIpYWkngeIrxwIxeYMkxlSptwm4rJh9qhvQv6is',
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrician',
    rating: '4.9',
    reviews: 200,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrTuAhtNOcV0ER_KEszgh0eoIUjkCaA8YGWBzmNvna_bPjiWmGK7oAw2ZaZfCTjavQFosI3lMUedjm6ZcqVXaEKnTeTK7HojH6ypSop3sqj4nuwsS1B6oXDjwjiyeGLbQ_tleq5tHJbc9xd8h-vhXrAUet2E1soczboPOPsbOPtdukHv-mrKj3aiW2O-ae1pwliLZPAQOHQQgr4HJNUp2Nd5gnXcpIJrCHQ7kn4oBKzPNAE2z-i69p-BYMkL9LnQy8T4qNiIjCG0g',
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'Neurologist',
    rating: '4.7',
    reviews: 150,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBY5hAjT_13zMDf_59qExVizyKGwnsp9aEP20ybdhQNYiTuPX1CxJfUyTHcI6_wbZfxvVzykbTrlDT13wU650ZSQZE6gnWb2xK797ddkbc7YkeVEu6Fg8ZLdQ3TYVqiVctX3-F3Kl5EuWQcb_qlACOKqEzb4RXRcUM7_Lp7BF_l8MUO6F-6teqkVvuVIHFAsoJ7Ars84hEan1d-mnifPOK09GYwsZDfI4jd7eOadx0NHfW7O-hNYmZ88ASfHf-bKzKIvzvwpowxKvQ',
  },
];

const savedLocationsMock: SavedLocation[] = [
  {
    id: 101,
    tag: 'Home Clinic',
    name: 'Seattle Downtown Medical Center',
    addressLine1: '1200 5th Ave Suite 200',
    addressLine2: 'Seattle, WA 98101',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiY6Aku8gxxxb_z2Qj1PZWNO5Rqmwp5k0JUkhX5eHIKZCWe2hOEtStStlTKUlHqbretyglNuowdO0kBPnczvOIadGtxLgfUv7gWymytiT9FlageBjrIdDjOpQLr133kvIOY1gkqEsoKmT4e9LQ_Qv1BAPjSza3zAoDDiSgDJ2bv6hKvwhlr8XmHw3FFfuY2YciIxJcBhanFFqBYxknPH6EoomKmZagZGHDEQJziH2LY2GaawZGzQeydbcXarwE4VgaA8DMcmJG1e0',
    lat: 47.6101,
    lng: -122.3365,
  },
  {
    id: 102,
    tag: 'Office Nearby',
    name: 'Bellevue Eastside Specialists',
    addressLine1: '10400 NE 4th St',
    addressLine2: 'Bellevue, WA 98004',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCTq0S3Z5lilWU9dmFbfRp5UAEKiyI2BKFAz-nxQcOOobCL-UE8i6rnDybeegVHRa3tg2pcq7C02bSK2Uh1W6PLlekEbu4NxHAiQi20pfPJLFwi5vO2AeXG-GzCzdp8a0RWd3KA_IIs4zC_qOZmDxdXsEJpppR_lXhNJ4wtx2NT-DojaxQ5nnDzUfe1V2GefWDxk05gs6GxTotBmYCB0HveZNNNbg4D4y_Gr9UsJQGFRBFbdWjczl1F6nIjI2c85NxJaKDEo4Awo4',
    lat: 47.6148,
    lng: -122.2001,
  },
];




const DoctorMap = dynamic(() => import('../../components/Map/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-surface text-text-muted text-sm">
      Loading map...
    </div>
  ),
});

const DEFAULT_USER_LOCATION: [number, number] = [47.6062, -122.3321];

export default function SavedItemsContent() {
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_USER_LOCATION);
  const [activeRouteLocationId, setActiveRouteLocationId] = useState<number | null>(null);

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

  const mapMarkers = useMemo(
    () =>
      savedLocationsMock.map((location) => ({
        id: location.id,
        name: location.name,
        specialty: location.tag,
        lat: location.lat,
        lng: location.lng,
        photo: location.image,
        isSelected: activeRouteLocationId === location.id,
      })),
    [activeRouteLocationId],
  );

  const routeTo = useMemo<[number, number] | null>(() => {
    if (!activeRouteLocationId) return null;
    const location = savedLocationsMock.find((item) => item.id === activeRouteLocationId);
    return location ? [location.lat, location.lng] : null;
  }, [activeRouteLocationId]);

  const activeLocation = useMemo(
    () => savedLocationsMock.find((item) => item.id === activeRouteLocationId) ?? null,
    [activeRouteLocationId],
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-text-base">Saved Items</h1>
        <p className="text-text-muted text-base">
          Manage your preferred healthcare professionals and facilities.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">stethoscope</span>
            <h2 className="text-2xl font-bold text-text-base">Saved Doctors</h2>
          </div>
          <span className="bg-card text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
            {savedDoctorsMock.length} Saved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedDoctorsMock.map((doctor) => (
            <article
              key={doctor.name}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div
                className="w-full aspect-4/3 bg-center bg-no-repeat bg-cover relative"
                style={{ backgroundImage: `url('${doctor.image}')` }}
              >
                <button className="absolute top-3 right-3 size-8 bg-card/90 rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-text-base mb-1">{doctor.name}</h3>
                  <p className="text-text-muted text-sm font-medium">{doctor.specialty}</p>
                </div>

                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="material-symbols-outlined text-yellow-400 text-[18px]">star</span>
                  <span className="text-text-base">{doctor.rating}</span>
                  <span className="text-text-muted ml-1">({doctor.reviews} reviews)</span>
                </div>

                <Link
                  href={`/doctors/${doctor.id}`}
                  className="w-full py-2.5 bg-surface text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-colors mt-2 text-sm text-center"
                >
                  Book Appointment
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6 bg-card p-8 rounded-2xl border border-border">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
            <h2 className="text-2xl font-bold text-text-base">Saved Locations</h2>
          </div>
          <span className="bg-surface text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
            {savedLocationsMock.length} Saved
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedLocationsMock.map((location) => {
            const isRouting = activeRouteLocationId === location.id;

            return (
            <article
              key={location.name}
              className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="w-full sm:w-2/5 h-48 sm:h-auto bg-center bg-no-repeat bg-cover relative"
                style={{ backgroundImage: `url('${location.image}')` }}
              >
                <button className="absolute top-3 right-3 size-8 bg-card/90 rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform shadow-sm sm:hidden">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between relative">
                <button className="absolute top-4 right-4 size-8 bg-card rounded-full hidden sm:flex items-center justify-center text-error hover:scale-110 transition-transform">
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
                  <button className="px-4 py-2 bg-card text-text-base font-semibold rounded-lg border border-border hover:border-primary transition-colors text-sm">
                    Details
                  </button>
                </div>
              </div>
            </article>
            );
          })}
        </div>

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
