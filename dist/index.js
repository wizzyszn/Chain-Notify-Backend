"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./utils/env");
const dotenv_1 = __importDefault(require("dotenv"));
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const port = (0, env_1.getEnvVar)("SERVER_PORT", "5000");
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const AuthenticateUser_1 = require("./middlewares/AuthenticateUser");
const quickNode_1 = require("./routes/quickNode");
const walletRoute_1 = require("./routes/walletRoute");
const userRoute_1 = require("./routes/userRoute");
const app = (0, express_1.default)();
app.use(cookieParser());
app.use((0, cors_1.default)({
    origin: 'https://chain-notify-frontend.vercel.app', // Frontend origin
    credentials: true, // Allow cookies or other credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '50mb' }));
//?* MIDDLEWARES
app.use(morgan("dev"));
//?* ROUTES 
app.use('/webhook/quicknode', quickNode_1.quickNodeRouter);
app.use('/api/v1/auth', userRoute_1.userRouter);
//app.use(authenticate);
app.use('/api/v1/wallet', AuthenticateUser_1.authenticate, walletRoute_1.walletRouter);
app.get('/testing', (req, res) => {
    res.send('working');
});
mongoose_1.default
    .connect((0, env_1.getEnvVar)("MONGODB_URL", "5000"))
    .then(() => {
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})
    .catch((res) => {
    console.error(res);
});
// Graceful Shutdown
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down server...");
    yield mongoose_1.default.connection.close();
    process.exit(0);
}));
