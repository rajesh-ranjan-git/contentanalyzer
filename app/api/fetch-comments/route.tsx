import { NextRequest, NextResponse } from "next/server";
import { AUTHORIZATION_TOKEN } from "@/config/config";

export async function POST(request: NextRequest) {
  // In a real application, you'd parse parameters from request.url.searchParams
  // e.g., const postId = request.nextUrl.searchParams.get('postid');
  // const hostName = request.nextUrl.searchParams.get('hostName');
  // Then construct the externalApiUrl dynamically.
  //   const externalApiUrl =
  //     "https://alpha-opinion.intoday.in/new/comment/getbypostid?hostName=alpha-businesstoday.intoday.in&postid=442980&contenttype=story&version=2.10";

  const { url } = await request.json();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `bearer ${AUTHORIZATION_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("rajesh response : ", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("rajesh errorText : ", errorText);
      console.error(`External API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `External API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in comments proxy API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments through proxy." },
      { status: 500 }
    );
  }
}
