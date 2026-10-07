const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

export async function getHealthEndpoint(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Failed to fetch API health");
  }

  return response.json();
}
