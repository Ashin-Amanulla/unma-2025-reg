
import Admin from "../models/Admin.js";




const loginSeedData = async () => {

    try {

        let admin = await Admin.findOne({ email: "admin@unma2025.org" });

        if (!admin) {

            let admin = {
                email: "admin@unma2025.org",
                password: "admin123",
                role: "admin",
                name: "Admin User",
                image: "https://via.placeholder.com/150",
            }

            await Admin.create(admin);

            console.log("Admin created successfully");
        } else {
            console.log("Admin already exists");
        }
    } catch (error) {
        console.log("Error creating admin", error);
    }
};

export default loginSeedData;