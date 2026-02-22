import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Proxy to Express backend
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await response.json();
    console.log(data);
    

    // Forward response
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
