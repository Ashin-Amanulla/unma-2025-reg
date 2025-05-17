import { z } from "zod";

const subAdminSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    district: z.string().min(1, "Please select a district"),
    role: z.enum(["sub_admin"]),
  });

export default subAdminSchema;