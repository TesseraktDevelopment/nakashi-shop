import arcjet, { fixedWindow } from "@arcjet/next";
import axios, { isAxiosError } from "axios";
import { type NextRequest, NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "60s",
      max: 3,
    }),
  ],
});

export async function GET(req: NextRequest) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests" }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const ico = searchParams.get("ico");

  if (!ico || !/^\d{8}$/.test(ico)) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid ICO format" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const response = await axios.get(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`,
      { headers: { accept: "application/json" } }
    );
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch ARES data" }),
        {
          status: error.response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
}
