import { Router } from "express";

//import { verifyAPIKey } from "../middlewares/QuickNodeApiKey";
//import { verifyQuickNodeSignature } from "../middlewares/QuickNodeSignature";
import { quicknodeWebHook } from "../controllers/quickNode";

const quickNodeRouter = Router();

quickNodeRouter.post('/', quicknodeWebHook);

export {quickNodeRouter}