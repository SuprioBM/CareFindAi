'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

type Doctor = {
  _id: string;
  fullName: string;
  specializationName: string;
  qualifications: string;
  experienceYears: number;
  gender: string;
  hospitalOrClinic: string;
  chamberAddress: string;
  area: string;
  city: string;
  district: string;
  country: string;
  latitude: number;
  longitude: number;
  consultation: string;
  appointmentPhone: string[];
  appointmentWebsite: string;
  bio: string;
  profileImage: string;
  fees: number;
  offday: string;

};



export default function DoctorProfilePage() {
  const params = useParams();
  const id = params?.id;
  const DoctorMap = dynamic(() => import('@/components/Map/map'), {
  ssr: false,
});
  

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/doctors/${id}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (data?.success) {
          setDoctor(data.data || null);
        } else {
          setError(data?.message || 'Failed to load doctor');
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoctor();
  }, [id]);

  useEffect(() => {
  async function loadBookmarks() {
    try {
      const res = await apiFetch('/bookmarks');
      const data = await res.json();

      if (!data.success) return;

      const ids = new Set<string>();
      const map: Record<string, string> = {};

      for (const b of data.data) {
        const doctorId: string = b.doctor._id ?? b.doctor;
        ids.add(doctorId);
        map[doctorId] = b._id;
      }

      setBookmarkedIds(ids);
      setBookmarkMap(map);
    } catch (e) {
      console.error(e);
    }
  }

  loadBookmarks();
}, []);

const toggleBookmark = async (doctorId: string) => {
  const alreadyBookmarked = bookmarkedIds.has(doctorId);

  if (alreadyBookmarked) {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      next.delete(doctorId);
      return next;
    });

    setBookmarkMap(prev => {
      const next = { ...prev };
      delete next[doctorId];
      return next;
    });
  } else {
    setBookmarkedIds(prev => new Set(prev).add(doctorId));
  }

  try {
    if (alreadyBookmarked) {
      const bookmarkId = bookmarkMap[doctorId];

      await apiFetch(`/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
      });
    } else {
      const response = await apiFetch('/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ doctor: doctorId, savedLocation: null }),
      });

      const data = await response.json();
      const newBookmarkId = data.data._id;

      setBookmarkMap(prev => ({ ...prev, [doctorId]: newBookmarkId }));
    }
  } catch (e) {
    console.error(e);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-muted">
        Loading doctor profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-muted">
        Doctor not found
      </div>
    );
  }

  const mapDoctors = doctor
  ? [
      {
        id: 1,
        name: doctor.fullName,
        specialty: doctor.specializationName,
        lat: doctor.latitude,
        lng: doctor.longitude,
        photo: doctor.profileImage || '/default-doctor.png',
        isSelected: true,
      },
    ]
  : [];
  return (
    <div className="bg-surface text-text-base min-h-screen">
      <div className="max-w-[960px] mx-auto px-6 py-6">

        {/* Breadcrumb */}
        <div className="flex gap-2 text-sm mb-4">
          <Link href="/" className="text-text-muted">Home</Link>
          <span>/</span>
          <Link href="/doctors" className="text-text-muted">Doctors</Link>
          <span>/</span>
          <span className="font-medium">{doctor.fullName}</span>
        </div>

        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6">

          <div className="flex gap-5 items-center">
           <img
            src={
              doctor.profileImage
                ? doctor.profileImage.startsWith('http')
                  ? doctor.profileImage
                  : `${process.env.NEXT_PUBLIC_API_URL}${doctor.profileImage}`
                : '/default-doctor.png'
            }
            alt={doctor.fullName}
            className="w-28 h-28 rounded-full object-cover border border-border"
          />

            <div>
              <h1 className="text-2xl font-bold">{doctor.fullName}</h1>

              <p className="text-primary font-medium">
                {doctor.specializationName}
              </p>


              <p className="text-sm text-text-muted">
                {doctor.city}, {doctor.country}
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
              <button
      onClick={() => toggleBookmark(doctor._id)}
      className="flex items-center gap-2 px-5 h-11 rounded-lg border border-border"
    >
      <span
        className="material-symbols-outlined"
        style={
          bookmarkedIds.has(doctor._id)
            ? { fontVariationSettings: "'FILL' 1", color: '#f43f5e' }
            : {}
        }
      >
        favorite
      </span>
      {bookmarkedIds.has(doctor._id) ? 'Saved' : 'Save'}
    </button>

          
          </div>
        </div>

        {/* Info */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold mb-2">About</h2>
            <p className="text-text-muted text-sm leading-relaxed">
              {doctor.bio || 'No bio available.'}
            </p>

            {doctor.qualifications && (
              <p className="mt-3 text-sm">
                <span className="font-medium">Qualifications: </span>
                {doctor.qualifications}
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold mb-2">Clinic</h2>

            <p className="text-sm text-text-muted">
              {doctor.hospitalOrClinic}
            </p>

            <p className="text-sm text-text-muted mt-2">
              {doctor.chamberAddress}
            </p>

            <p className="text-sm text-text-muted mt-2">
              {doctor.area}, {doctor.district}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card border border-border rounded-xl p-5 mt-6">
          <h2 className="font-semibold mb-3">Contact</h2>

          {doctor.appointmentPhone?.length > 0 && (
            <div className="text-sm text-text-muted">
              <p className="font-medium text-text-base mb-1">Phone:</p>
              {doctor.appointmentPhone.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {/* Map */}
<div className="bg-card border border-border rounded-xl p-5 mt-6">
  <h2 className="font-semibold mb-3">Location</h2>

 <div className="bg-card border border-border rounded-xl p-5 mt-6 h-[400px]">
  <DoctorMap
    userLocation={[doctor.latitude, doctor.longitude]} // you can later replace with real user loc
    doctors={mapDoctors}
    onDoctorClick={() => {}}
    routeTo={null}
    onClearRoute={() => {}}
  />
</div>
</div>

          {doctor.appointmentWebsite && (
            <a
              href={doctor.appointmentWebsite}
              target="_blank"
              className="text-primary text-sm mt-2 inline-block"
            >
              Visit Website
            </a>
          )}
        </div>

        {/* Medical */}
        <div className="bg-card border border-border rounded-xl p-5 mt-6">
          <h2 className="font-semibold mb-2">Consultation</h2>

          <p className="text-sm text-text-muted">
            {doctor.consultation || 'Not specified'}
          </p>

          <p className="text-sm mt-2">
          </p>

          <p className="text-sm mt-1">
            <span className="font-medium">Off Day:</span>{' '}
            {doctor.offday || 'Not specified'}
          </p>
        </div>

      </div>
    </div>
  );
}