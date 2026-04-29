/**
 * Doctor Controller
 *
 * The system shall allow users to view detailed doctor profiles,
 *        including specialization, chamber information, and contact details from the dashboard.
 *
 * This controller handles all operations related to doctor profiles.
 * It powers both the admin-facing doctor management and the patient-facing doctor search & profile view.
 *
 * Functions:
 *   toRadians          → Helper: Converts degrees to radians (used for distance math)
 *   getDistanceInKm    → Helper: Calculates real-world distance between two GPS coordinates
 *   createDoctor       → [Admin] Creates a new doctor profile in the database
 *   getAllDoctors       → [Admin] Lists all doctors with optional filters
 *   getDoctorById      → [] Fetches the FULL detailed profile of a single doctor by ID
 *   updateDoctor       → [Admin] Updates a doctor's profile information
 *   deleteDoctor       → [Admin] Permanently removes a doctor from the database
 *   getNearbyDoctors   → Finds active, approved doctors near a given GPS location
 *   manualSearch       → Searches doctors by flexible filters (name, specialty, city, fees, etc.)
 */

import Doctor from "../models/doctor.model.js";

// ── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Helper: Converts a degree value to radians.
 * Radians are required for trigonometric functions used in distance calculation.
 * Formula: radians = degrees × (π / 180)
 */
function toRadians(value) {
  return (value * Math.PI) / 180;
}

/**
 * Helper: Calculates the straight-line distance (in km) between two GPS points.
 *
 * Uses the Haversine formula — the standard method for calculating distances
 * between two points on the surface of a sphere (Earth in this case).
 *
 * This is used in the "Find Nearby Doctors" feature to compute how far each doctor is
 * from the user's current location, and to sort results by proximity.
 *
 * @param lat1 - Latitude of Point 1 (user's location)
 * @param lon1 - Longitude of Point 1 (user's location)
 * @param lat2 - Latitude of Point 2 (doctor's chamber)
 * @param lon2 - Longitude of Point 2 (doctor's chamber)
 * @returns Distance in kilometers between the two points
 */
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371; // Earth's radius in kilometers

  // Calculate the difference in latitude and longitude, converted to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // Haversine formula — computes the angular distance between the two points
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // Convert the angular distance to actual distance on the Earth's surface
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c; // Returns distance in km
}

// ── Doctor CRUD Operations ────────────────────────────────────────────────────

/**
 * Controller: Create a new doctor profile [Admin only]
 *
 * Allows an admin to manually add a new doctor to the database.
 * The doctor's full profile (name, specialization, chamber, fees, contact, etc.)
 * is submitted in the request body and saved to the "doctors" collection.
 *
 * Route: POST /api/doctors
 * Access: Private + Admin
 */
export async function createDoctor(req, res) {
  try {
    // Create the doctor document using all fields from req.body,
    // and record which admin account added this profile.
    // req.user?.id → the admin's user ID (from auth middleware). Null if somehow missing.
    const doctor = await Doctor.create({
      ...req.body,                        // All doctor details (name, specialty, address, etc.)
      addedByAdmin: req.user?.id || null, // Track which admin added this profile
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
 * Controller: Get all doctors [Admin only]
 *
 * Returns a list of all doctors in the database.
 * Supports optional query-string filters so admins can narrow results:
 *   - ?specialization=ID    → Only doctors in this specialty
 *   - ?city=Dhaka           → Only doctors in this city
 *   - ?area=Dhanmondi       → Only doctors in this area
 *   - ?isActive=true/false  → Filter by active/inactive status
 *   - ?isApproved=true/false→ Filter by approval status
 *
 * Route: GET /api/doctors
 * Access: Private + Admin
 */
export async function getAllDoctors(req, res) {
  try {
    // Extract filter options from the URL query parameters
    const { specialization, city, area, isActive, isApproved } = req.query;

    // Build a dynamic filter object based on which parameters were provided.
    // Only add a filter condition if the parameter was actually passed in the request.
    const filter = {};

    if (specialization) filter.specialization = specialization;
    if (city) filter.city = city;
    if (area) filter.area = area;
    // Convert string "true"/"false" to actual boolean for database query
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
    if (typeof isApproved !== "undefined") filter.isApproved = isApproved === "true";

    // Fetch matching doctors and populate related data for display:
    //   - "specialization" → replaces the ObjectId with the full specialization document
    //   - "addedByAdmin"   → replaces the admin's ID with their name and email
    const doctors = await Doctor.find(filter)
      .populate("specialization")
      .populate("addedByAdmin", "name email") // Only fetch admin's name and email (not full profile)
      .sort({ createdAt: -1 }); // Newest doctors first

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
 * Controller: Get a single doctor's full profile by ID
 *
 * This is the main function behind the "View Doctor Profile" feature ().
 * When a user clicks on a doctor's card in search results or in their saved doctors list,
 * this endpoint is called to fetch the complete profile — including:
 *   - Full name, qualifications, experience, bio, and profile photo
 *   - Their specialization (fetched from the Specialization collection)
 *   - Chamber address, hospital/clinic name, area, city
 *   - Appointment phone numbers and website
 *   - Consultation type, fees, and off-days
 *
 * Route: GET /api/doctors/:id
 * Access: Private (logged-in users)
 */
export async function getDoctorById(req, res) {

  try {
    // Find the doctor using the ID from the URL (e.g., /api/doctors/64abc123...)
    // Populate "specialization" to get the full specialty info (name, description, etc.)
    // Populate "addedByAdmin" to show which admin verified this doctor
    const doctor = await Doctor.findById(req.params.id)
      .populate("specialization")              // Replace specialization ID with full specialty object
      .populate("addedByAdmin", "name email"); // Include admin info for transparency

    // If no doctor found with this ID, return a 404 Not Found response
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Return the full doctor profile for display on the profile page
    return res.status(200).json({
      success: true,
      data: doctor, // Complete doctor object with all profile fields
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
 * Controller: Update a doctor's profile [Admin only]
 *
 * Allows an admin to modify any field in an existing doctor's profile.
 * For example: updating fees, changing the chamber address, uploading a new photo,
 * toggling active/approved status, or correcting wrong information.
 *
 * Route: PATCH /api/doctors/:id
 * Access: Private + Admin
 */
export async function updateDoctor(req, res) {
  try {
    // Find the doctor by ID and apply the updates from req.body.
    // { new: true } → returns the updated document (not the old version before the update)
    // { runValidators: true } → validates the new values against the schema rules
    //   (e.g., latitude must be between -90 and 90, fullName must be at least 2 chars)
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("specialization"); // Return the updated doctor with full specialty info

    // If doctor ID doesn't exist in the database
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor, // The updated doctor profile
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
 * Controller: Delete a doctor profile [Admin only]
 *
 * Permanently removes a doctor's profile from the database.
 * This action is irreversible — use with caution.
 * Used when a doctor's profile is fraudulent, duplicate, or no longer valid.
 *
 * Route: DELETE /api/doctors/:id
 * Access: Private + Admin
 */
export async function deleteDoctor(req, res) {
  try {
    // Find the doctor by ID and delete them from the database in one operation.
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    // If no doctor found with this ID (already deleted or wrong ID)
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

// ── Search Operations ─────────────────────────────────────────────────────────

/**
 * Controller: Find nearby doctors based on GPS location
 *
 * Core of the "Find Doctors Near Me" feature. Takes the user's current GPS coordinates
 * and returns all active, approved doctors whose chamber is within the specified radius.
 *
 * Uses MongoDB's built-in geospatial query ($near + 2dsphere index) for efficient
 * distance-based filtering. Results are automatically sorted nearest-first by MongoDB.
 *
 * Only returns doctors that are BOTH active (isActive: true) AND approved (isApproved: true).
 * This ensures patients only see verified, currently practicing doctors.
 *
 * Route: GET /api/doctors/nearby/search
 * Access: Public
 * Query params:
 *   - latitude     (required) → User's current latitude
 *   - longitude    (required) → User's current longitude
 *   - radius       (optional) → Search radius in km. Default: 20km
 *   - specialization (optional) → Filter by specialty name
 */
export async function getNearbyDoctors(req, res) {
  try {
    // Extract location coordinates and optional filters from query parameters.
    // Default search radius is 20 km if not specified.
    const { latitude, longitude, radius = 20, specialization } = req.query;

    // Convert string query params to numbers for mathematical operations.
    const userLat = Number(latitude);
    const userLng = Number(longitude);
    const maxRadiusKm = Number(radius);

    // Validate that the coordinates and radius are actual valid numbers.
    // NaN would crash the geospatial query, so we catch it here early.
    if (Number.isNaN(userLat) || Number.isNaN(userLng) || Number.isNaN(maxRadiusKm)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude, longitude, and radius are required",
      });
    }

    // Build the MongoDB geospatial filter.
    // $near finds all documents whose "location" field is within $maxDistance meters
    // of the provided coordinates, sorted from nearest to farthest automatically.
    const filter = {
      isActive: true,    // Only show doctors who are currently active
      isApproved: true,  // Only show admin-verified doctor profiles
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userLng, userLat], // GeoJSON requires [longitude, latitude] order
          },
          $maxDistance: maxRadiusKm * 1000, // MongoDB uses meters, so convert km → meters
        },
      },
    };

    // If a specialization name filter was provided, add it to the query.
    // .trim() removes any accidental whitespace from the query string.
    if (specialization?.trim()) {
      filter.specializationName = specialization.trim();
    }

    // Execute the geospatial query — MongoDB returns results sorted by distance (nearest first)
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

/**
 * Controller: Manual search for doctors with flexible filters
 *
 * Allows patients to search for doctors using a combination of various filters.
 * Unlike nearby search (GPS-based), this is text/category-based filtering.
 * Only active + approved doctors are returned.
 *
 * Route: GET /api/doctors/manual/search
 * Access: Public
 * Query params (all optional — combine any):
 *   - specialization   → Filter by specialization ObjectId
 *   - fullName         → Partial name search (case-insensitive)
 *   - qualifications   → Filter by degree/qualification text
 *   - gender           → Filter by doctor's gender
 *   - hospitalOrClinic → Filter by hospital/clinic name
 *   - chamberAddress   → Filter by chamber address text
 *   - area             → Filter by area/neighborhood
 *   - city             → Filter by city
 *   - district         → Filter by district
 *   - country          → Filter by country
 *   - consultation     → Filter by consultation type
 *   - fees             → Filter by exact consultation fee
 *   - offday           → Filter by off day (e.g., "Friday")
 */
export async function manualSearch(req, res) {
  try {
    // Extract all possible filter parameters from the URL query string.
    // All are optional — the function works even if none are provided (returns all active doctors).
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
     //const{image}= req.body --- frontend to backend new data send to communicate
    // Start with a base filter that always ensures only active + approved doctors are returned.
    // This is the minimum requirement — patients should never see inactive/unapproved doctors.
    const filter = {   
      isActive: true,
      isApproved: true,
    };

    // Add each optional filter only if it was provided in the request.
    // Text fields use $regex for partial, case-insensitive matching
    // (so searching "dhaka" also matches "Dhaka", "Greater Dhaka", etc.)

    if (specialization) {
      filter.specialization = specialization; // Exact ID match for specialization
    }

    // $regex → partial text match  |  $options: "i" → case-insensitive
    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };
    if (qualifications) filter.qualifications = { $regex: qualifications, $options: "i" };
    if (gender) filter.gender = gender; // Exact match (e.g., "male", "female", "other")
    if (hospitalOrClinic) filter.hospitalOrClinic = { $regex: hospitalOrClinic, $options: "i" };
    if (chamberAddress) filter.chamberAddress = { $regex: chamberAddress, $options: "i" };
    if (area) filter.area = { $regex: area, $options: "i" };
    if (city) filter.city = { $regex: city, $options: "i" };
    if (district) filter.district = { $regex: district, $options: "i" };
    if (country) filter.country = { $regex: country, $options: "i" };
    if (consultation) filter.consultation = consultation; // Exact match for consultation type
    if (offday) filter.offday = offday; // Exact match for off day

    // Handle fees filter — it's a number, not a string, so we parse it carefully.
    // We skip the filter if fees is empty or not a valid number.
    if (typeof fees !== "undefined" && fees !== "") {
      const parsedFees = Number(fees);
      if (!Number.isNaN(parsedFees)) {
        filter.fees = parsedFees; // Exact fee match (e.g., fees=500 → doctors charging exactly 500)
      }
    }

    // Execute the search query with all applied filters.
    // Populate specialization to include full specialty info in results.
    const doctors = await Doctor.find(filter)
      .populate("specialization")
      .sort({ createdAt: -1 }); // Newest profiles first

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
