/**
 * Doctor Controller
 *
 * Functions:
 * toRadians - Converts degrees to radians
 * getDistanceInKm - Calculates distance between two coordinates using Haversine formula
 * createDoctor - Creates a doctor profile and records which authenticated admin added it
 * getAllDoctors - Returns doctors with optional query-string filters for specialization, location, and moderation flags
 * getDoctorById - Fetches a single doctor record by MongoDB id
 * updateDoctor - Updates a doctor document and returns the validated result
 * deleteDoctor - Removes a doctor record permanently
 * getNearbyDoctors - Finds approved, active doctors near a given coordinate and returns them sorted by computed distance
 * manualSearch - Performs manual search for doctors with various filters
 */

import Doctor from "../models/doctor.model.js";

// Convert degrees to radians
/**
 * Converts degrees to radians
 */
function toRadians(value) {
  return (value * Math.PI) / 180;
}

// Calculate distance between two coordinates using Haversine formula
/**
 * Uses the Haversine formula to estimate distance between two coordinates.
 */
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

// Create a new doctor
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

// Get all doctors
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

// Get a single doctor by ID
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

// Update a doctor's details by ID
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

// Delete a doctor by ID
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

// Find nearby doctors by location
/**
 * Finds approved, active doctors near a given coordinate and returns them
 * sorted by computed distance in kilometers.
 */
export async function getNearbyDoctors(req, res) {
  try {
    const { latitude, longitude, radius = 20, specialization } = req.query;

  

    const userLat = Number(latitude);
    const userLng = Number(longitude);
    const maxRadiusKm = Number(radius);

    if (Number.isNaN(userLat) || Number.isNaN(userLng) || Number.isNaN(maxRadiusKm)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude, longitude, and radius are required",
      });
    }

    const filter = {
      isActive: true,
      isApproved: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userLng, userLat],
          },
          $maxDistance: maxRadiusKm * 1000,
        },
      },
    };

    if (specialization?.trim()) {
      filter.specializationName = specialization.trim();
    }

    const doctors = await Doctor.find(filter).populate("specialization");
    

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby doctors",
      error: error.message,
    });
  }
}

// Manual Search
/**
 * Performs manual search for doctors with various filters
 */
export async function manualSearch(req, res) {
  try {
    const {
      specialization,
      fullName,
      qualifications,
      gender,
      hospitalOrClinic,
      chamberAddress,
      area,
      city,
      district,
      country,
      consultation,
      fees,
      offday,
    } = req.query;


    const filter = {
      isActive: true,
      isApproved: true,
    };

    if (specialization) {
      filter.specialization = specialization;
    }

    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };
    if (qualifications) filter.qualifications = { $regex: qualifications, $options: "i" };
    if (gender) filter.gender = gender;
    if (hospitalOrClinic) filter.hospitalOrClinic = { $regex: hospitalOrClinic, $options: "i" };
    if (chamberAddress) filter.chamberAddress = { $regex: chamberAddress, $options: "i" };
    if (area) filter.area = { $regex: area, $options: "i" };
    if (city) filter.city = { $regex: city, $options: "i" };
    if (district) filter.district = { $regex: district, $options: "i" };
    if (country) filter.country = { $regex: country, $options: "i" };
    if (consultation) filter.consultation = consultation;
    if (offday) filter.offday = offday;

    if (typeof fees !== "undefined" && fees !== "") {
      const parsedFees = Number(fees);
      if (!Number.isNaN(parsedFees)) {
        filter.fees = parsedFees;
      }
    }

    const doctors = await Doctor.find(filter)
      .populate("specialization")
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



