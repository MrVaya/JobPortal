import dotenv from "dotenv";
import app from "./app";
import authRoutes from "./modules/auth/auth.routes";

import cookieParser from "cookie-parser";


dotenv.config();
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});