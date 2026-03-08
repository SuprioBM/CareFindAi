import DoctorJoinRequest from "../models/doctorJoinRequest.model.js";
import Doctor from "../models/doctor.model.js";

export async function createDoctorJoinRequest(req, res) {
  try {
    const request = await DoctorJoinRequest.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Doctor join request submitted successfully",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit doctor join request",
      error: error.message,
    });
  }
}

export async function getAllDoctorJoinRequests(req, res) {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const requests = await DoctorJoinRequest.find(filter)
      .populate("specialization")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor join requests",
      error: error.message,
    });
  }
}

export async function getDoctorJoinRequestById(req, res) {
  try {
    const request = await DoctorJoinRequest.findById(req.params.id)
      .populate("specialization")
      .populate("reviewedBy", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Doctor join request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor join request",
      error: error.message,
    });
  }
}

export async function reviewDoctorJoinRequest(req, res) {
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either approved or rejected",
      });
    }

    const request = await DoctorJoinRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Doctor join request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been reviewed",
      });
    }

    request.status = status;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.rejectionReason = status === "rejected" ? rejectionReason || "" : "";

    await request.save();

    if (status === "approved") {
      await Doctor.create({
        fullName: request.fullName,
        specialization: request.specialization,
        qualifications: request.qualifications,
        experienceYears: request.experienceYears,
        hospitalOrClinic: request.hospitalOrClinic,
        chamberAddress: request.chamberAddress,
        area: request.area,
        city: request.city,
        district: request.district,
        country: request.country,
        latitude: request.latitude,
        longitude: request.longitude,
        appointmentPhone: request.appointmentPhone,
        appointmentWebsite: request.appointmentWebsite,
        isApproved: true,
        isActive: true,
        addedByAdmin: req.user.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Doctor join request ${status} successfully`,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to review doctor join request",
      error: error.message,
    });
  }
}