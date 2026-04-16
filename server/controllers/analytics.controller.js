import SymptomSearch from "../models/symptomSearch.model.js";

export const getAnalytics = async (req, res) => {
  try {

    // 🔥 TOP SYMPTOMS (from matchedSymptoms array)
    const topSymptoms = await SymptomSearch.aggregate([
      { $unwind: "$matchedSymptoms" }, // important (array → individual)
      { $group: { _id: "$matchedSymptoms", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    // 🔥 TOP SPECIALISTS
    const topSpecialists = await SymptomSearch.aggregate([
      {
        $match: {
          recommendedSpecializationName: { $ne: "" }
        }
      },
      {
        $group: {
          _id: "$recommendedSpecializationName",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    // 📊 SYSTEM STATS
    const totalSearches = await SymptomSearch.countDocuments();

    // 🔥 URGENCY BREAKDOWN (bonus — useful)
    const urgencyStats = await SymptomSearch.aggregate([
      { $group: { _id: "$urgencyLevel", count: { $sum: 1 } } }
    ]);

    // 🧠 KPI
    const kpis = {
      totalPatients: totalSearches,
      activeProviders: topSpecialists.length, // better than fake
      appointmentsToday: 0, // keep placeholder
      revenueMTD: 0 // placeholder
    };

    // 📈 REAL PATIENT GROWTH (last 4 weeks)
    const patientGrowthRaw = await SymptomSearch.aggregate([
      {
        $group: {
          _id: {
            week: { $week: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.week": 1 } },
      { $limit: 4 }
    ]);

    const patientGrowth = patientGrowthRaw.map((item, i) => ({
      label: `Week ${i + 1}`,
      value: item.count
    }));

    // 📊 BAR CHART
    const max = Math.max(...topSpecialists.map(s => s.count), 1);

    const revenueByDept = topSpecialists.map((s) => ({
      label: s.name,
      value: s.count,
      height: (s.count / max) * 100
    }));


     console.log("topSpecialists:", topSpecialists);
     console.log("topSymptoms:", topSymptoms);
     console.log("totalSearches:", totalSearches);
     console.log("kpis:", kpis);
     console.log("patientGrowth:", patientGrowth);
     console.log("revenueByDept:", revenueByDept);
     console.log("urgencyStats:", urgencyStats);

    // ✅ RESPONSE
    res.json({
      kpis,
      topSymptoms,
      topSpecialists,
      urgencyStats,
      systemStats: {
        totalSearches
      },
      patientGrowth,
      revenueByDept
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};