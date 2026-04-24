import Doctor from "../models/doctor.model.js";

function escapeRegExp(input) {
	return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class SpecialityService {
	async matchBySpecialties(specialties = [], limit = 10) {
		const cleaned = Array.isArray(specialties)
			? specialties.map((item) => String(item).trim()).filter(Boolean)
			: [];

		if (!cleaned.length) {
			return [];
		}

		const regexList = cleaned.map((name) => new RegExp(`^${escapeRegExp(name)}$`, "i"));

		const doctors = await Doctor.find({
			isActive: true,
			isApproved: true,
			specializationName: { $in: regexList }
		})
			.select("fullName specializationName city area hospitalOrClinic experienceYears")
			.limit(limit)
			.lean();

		return doctors.map((doctor) => ({
			name: doctor.fullName,
			specialty: doctor.specializationName,
			city: doctor.city,
			area: doctor.area,
			experienceYears: doctor.experienceYears,
			hospitalOrClinic: doctor.hospitalOrClinic
		}));
	}
}
