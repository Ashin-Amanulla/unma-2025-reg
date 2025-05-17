import Registration from '../models/Registration.js';


export const getAnalytics = async (req, res) => {
    try {
        console.log("getAnalytics");
        // Get pending payments
        const pendingPayments = await Registration.find({
            willContribute: true,
            paymentStatus: { $in: ["Pending", null, ""] }
        }).select('name email district contactNumber contributionAmount').limit(100);

        // Get accommodations needed
        const needAccommodation = await Registration.find({
            isAttending: true,
            accommodation: { $in: ["need", "looking"] }
        }).select('name email district contactNumber').limit(100);

        // Get volunteers
        const volunteers = await Registration.find({
            eventContribution: { $elemMatch: { $eq: "volunteer" } }
        }).select('name email district contactNumber').limit(100);

        // Get ride share
        const rideShare = await Registration.find({
            $or: [
                { readyForRideShare: "yes" },
                { wantRideShare: "yes" },
                { carPooling: { $in: ["Yes To Venue", "Yes From Venue", "Yes Both Ways"] } }
            ]
        }).select('name email district contactNumber').limit(100);

        // Get sponsors
        const sponsors = await Registration.find({
            $or: [
                { interestedInSponsorship: true },
                { sponsorshipType: { $exists: true, $not: { $size: 0 } } }
            ]
        }).select('name email district contactNumber').limit(100);

        // District-wise registrations
        const districtWise = await Registration.aggregate([
            { $match: { district: { $exists: true, $ne: "" } } },
            { $group: { _id: "$district", count: { $sum: 1 } } },
            { $project: { district: "$_id", count: 1, _id: 0 } },
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]);

        // School-wise alumni registrations
        const schoolWise = await Registration.aggregate([
            {
                $match: {
                    registrationType: "Alumni",
                    school: { $exists: true, $ne: "" }
                }
            },
            { $group: { _id: "$school", count: { $sum: 1 } } },
            { $project: { school: "$_id", count: 1, _id: 0 } },
            { $sort: { count: -1 } }
        ]);

        // Registration type counts
        const registrationTypeCounts = await Registration.aggregate([
            {
                $group: {
                    _id: "$registrationType",
                    count: { $sum: 1 }
                }
            },
            { $project: { type: "$_id", count: 1, _id: 0 } }
        ]);

        // Format registration type counts for easier frontend consumption
        const registrationTypeCount = {
            alumni: 0,
            staff: 0,
            other: 0
        };

        registrationTypeCounts.forEach(item => {
            if (item.type === "Alumni") registrationTypeCount.alumni = item.count;
            if (item.type === "Staff") registrationTypeCount.staff = item.count;
            if (item.type === "Other") registrationTypeCount.other = item.count;
        });

        // Payment status counts
        const paymentStatusCounts = await Registration.aggregate([
            { $match: { willContribute: true } },
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 }
                }
            },
            { $project: { status: "$_id", count: 1, _id: 0 } }
        ]);

        // Format payment status counts for easier frontend consumption
        const paymentStatusCount = {
            completed: 0,
            pending: 0,
            failed: 0
        };

        paymentStatusCounts.forEach(item => {
            if (item.status === "Completed") paymentStatusCount.completed = item.count;
            if (item.status === "Pending" || item.status === null || item.status === "") {
                paymentStatusCount.pending += item.count;
            }
            if (item.status === "Failed") paymentStatusCount.failed = item.count;
        });

        let response = {
            pendingPayments: pendingPayments.map(p => ({
                _id: p._id,
                name: p.name,
                email: p.email,
                district: p.district,
                phone: p.contactNumber,
                amountDue: p.contributionAmount
            })),
            needAccommodation: needAccommodation.map(a => ({
                _id: a._id,
                name: a.name,
                email: a.email,
                district: a.district,
                phone: a.contactNumber
            })),
            volunteers: volunteers.map(v => ({
                _id: v._id,
                name: v.name,
                email: v.email,
                district: v.district,
                phone: v.contactNumber
            })),
            rideShare: rideShare.map(r => ({
                _id: r._id,
                name: r.name,
                email: r.email,
                district: r.district,
                phone: r.contactNumber
            })),
            sponsors: sponsors.map(s => ({
                _id: s._id,
                name: s.name,
                email: s.email,
                district: s.district,
                phone: s.contactNumber
            })),
            districtWise,
            schoolWise,
            registrationTypeCount,
            paymentStatusCount
        };

        console.log("response", response);

        res.json(response);
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Error fetching analytics data" });
    }
}; 
