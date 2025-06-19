import { NextRequest, NextResponse } from "next/server";
import { AUTHORIZATION_TOKEN, COMMENTS_JSON_URL } from "@/config/config";

export async function POST(request: NextRequest) {
  const { url, hostname, postId, contentType } = await request.json();

  try {
    let response;
    if (url) {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const params = new URLSearchParams({
        hostname: hostname,
        postId: postId,
        contentType: contentType,
      });

      const urlWithParams = `${COMMENTS_JSON_URL}?${params.toString()}&version=2.10`;

      response = await fetch(urlWithParams, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AUTHORIZATION_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (!response.status || response.status !== 200) {
      const errorText = await response.text();
      console.error(`External API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `External API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data && data?.data) {
      return NextResponse.json(data.data, { status: response.status });
    } else {
      console.error("Error while fetching comments");
      return NextResponse.json(
        { error: "Failed to fetch comments data." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in comments proxy API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments through proxy." },
      { status: 500 }
    );
  }
}
