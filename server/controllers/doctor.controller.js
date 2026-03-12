import Doctor from "../models/doctor.model.js";

function toRadians(value) {
  return (value * Math.PI) / 180;
}

// Uses the Haversine formula to estimate distance between two coordinates.
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

/**
 * Creates a doctor profile and records which authenticated admin added it.
 */
export async function createDoctor(req, res) {
  try {
    const doctor = await Doctor.create({
      ...req.body,
      addedByAdmin: req.user?.id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message,
    });
  }
}

/**
 * Returns doctors with optional query-string filters for specialization,
 * location, and moderation flags.
 */
export async function getAllDoctors(req, res) {
  try {
    const { specialization, city, area, isActive, isApproved } = req.query;

    const filter = {};

    if (specialization) filter.specialization = specialization;
    if (city) filter.city = city;
    if (area) filter.area = area;
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
    if (typeof isApproved !== "undefined") filter.isApproved = isApproved === "true";

    const doctors = await Doctor.find(filter)
      .populate("specialization")
      .populate("addedByAdmin", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
}

/**
 * Fetches a single doctor record by MongoDB id.
 */
export async function getDoctorById(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("specialization")
      .populate("addedByAdmin", "name email");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
}

/**
 * Updates a doctor document and returns the validated result.
 */
export async function updateDoctor(req, res) {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("specialization");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
}

/**
 * Removes a doctor record permanently.
 */
export async function deleteDoctor(req, res) {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message,
    });
  }
}

/**
 * Finds approved, active doctors near a given coordinate and returns them
 * sorted by computed distance in kilometers.
 */
export async function getNearbyDoctors(req, res) {
  try {
    const { latitude, longitude, radius = 10, specialization } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude are required",
      });
    }

    const filter = {
      isActive: true,
      isApproved: true,
    };

    if (specialization) {
      filter.specialization = specialization;
    }

    const doctors = await Doctor.find(filter).populate("specialization");

    const userLat = Number(latitude);
    const userLng = Number(longitude);
    const maxRadius = Number(radius);

    const doctorsWithDistance = doctors
      .map((doctor) => {
        const distanceKm = getDistanceInKm(
          userLat,
          userLng,
          doctor.latitude,
          doctor.longitude
        );

        return {
          ...doctor.toObject(),
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((doctor) => doctor.distanceKm <= maxRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      success: true,
      count: doctorsWithDistance.length,
      data: doctorsWithDistance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby doctors",
      error: error.message,
    });
  }
}