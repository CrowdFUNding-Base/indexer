import axios from "axios";
import env from "dotenv";

env.config();

// Backend URL untuk webhook sync
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3300";
const PONDER_API_KEY = process.env.PONDER_SYNC_API_KEY || "ponder-sync-key";

/**
 * Helper function untuk push data ke Backend PostgreSQL
 * @param endpoint - Endpoint path (e.g., "campaign", "donation", "badge")
 * @param data - Data object to send
 */
export async function pushToBackend(
  endpoint: string,
  data: any,
): Promise<void> {
  try {
    console.log(
      `🚀 Pushing to backend: ${endpoint}`,
      JSON.stringify(data, null, 2),
    );

    const response = await axios.post(
      `${BACKEND_URL}/api/sync/${endpoint}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "x-ponder-api-key": PONDER_API_KEY,
        },
        timeout: 10000, // 10 second timeout
      },
    );

    console.log(`✅ Pushed to backend: ${endpoint}`, response.status);
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      console.error(
        `❌ Failed to push to backend: ${endpoint}`,
        `Status: ${error.response.status}`,
        error.response.data,
      );
    } else if (error.request) {
      // Request was made but no response received
      console.error(
        `❌ No response from backend: ${endpoint}`,
        "Backend might be down or unreachable",
      );
    } else {
      // Error setting up request
      console.error(`❌ Error pushing to backend: ${endpoint}`, error.message);
    }
  }
}
