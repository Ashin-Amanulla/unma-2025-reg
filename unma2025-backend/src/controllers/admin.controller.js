import Admin from "../models/Admin.js";
import { logger } from "../utils/logger.js";
import Registration from "../models/Registration.js";
import Transaction from "../models/Transaction.js";



export const getAdmin = async (req, res) => {
    try {

        const admin = await Admin.find();
        res.status(200).json(admin);

    } catch (error) {
        logger.error(`Error getting admin: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}


export const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id);
        res.status(200).json(admin);
    } catch (error) {
        logger.error(`Error getting admin: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }

}


export const createAdmin = async (req, res) => {
    try {
        const admin = await Admin.create(req.body);
        res.status(201).json(admin);
    } catch (error) {
        logger.error(`Error creating admin: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }

}


export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(admin);
    } catch (error) {
        logger.error(`Error updating admin: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }

}


export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByIdAndDelete(id);
        res.status(200).json({ message: 'Admin deleted successfully', admin });
    } catch (error) {
        logger.error(`Error deleting admin: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}   

//dashboard stats

export const getDashboardStats = async (req, res) => {
    try {
        const totalRegistrations = await Registration.countDocuments();
        const totalAdmins = await Admin.countDocuments();
        const totalFundCollected = await Transaction.aggregate([
            { $match: {} },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const todaysRegistrations = await Registration.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
        const todaysPayments = await Transaction.aggregate([
            { $match: { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]); 

     
        const stats = {
            totalRegistrations,
            totalAdmins,   
            todaysRegistrations,
        }

       //total attendence by counting number of attendence in each registration att3ndence schema

       const totalAttendees = await Registration.aggregate([
        { $match: { isAttending: true } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: [
                  { $ifNull: ['$attendees.adults.veg', 0] },
                  { $ifNull: ['$attendees.adults.nonVeg', 0] },
                  { $ifNull: ['$attendees.teens.veg', 0] },
                  { $ifNull: ['$attendees.teens.nonVeg', 0] },
                  { $ifNull: ['$attendees.children.veg', 0] },
                  { $ifNull: ['$attendees.children.nonVeg', 0] },
                  { $ifNull: ['$attendees.toddlers.veg', 0] },
                  { $ifNull: ['$attendees.toddlers.nonVeg', 0] }
                ]
              }
            }
          }
        }
      ]);
      
      stats.totalAttendees = totalAttendees[0]?.total || 0;
      stats.totalFundCollected = totalFundCollected[0]?.total || 0;
      stats.todaysPayments = todaysPayments[0]?.total || 0;





        res.status(200).json(stats);    
    } catch (error) {
        logger.error(`Error getting dashboard stats: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

