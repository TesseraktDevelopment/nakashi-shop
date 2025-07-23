import { NextRequest } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ico = searchParams.get("ico");

  if (!ico || !/^\d{8}$/.test(ico)) {
    return new Response(JSON.stringify({ error: "Invalid ICO format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await axios.get(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`,
      { headers: { accept: "application/json" } }
    );
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status) {
      return new Response(JSON.stringify({ error: "Failed to fetch ARES data" }), {
        status: error.response.status,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}
