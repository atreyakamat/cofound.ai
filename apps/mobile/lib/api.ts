import { ApiClient } from "@cofound/shared";
import { getToken } from "./auth";

// Change this to your deployed URL or use ngrok for development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export const api = new ApiClient(API_BASE_URL, getToken);
