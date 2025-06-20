import { NextRequest, NextResponse } from "next/server";
import {
  BT_ALPHA_COMMENTS_JSON_URL,
  BT_PROD_COMMENTS_JSON_URL,
  IT_ALPHA_COMMENTS_JSON_URL,
  IT_PROD_COMMENTS_JSON_URL,
  BT_ALPHA_COMMENT_AUTHORIZATION_TOKEN,
  BT_DEV_COMMENT_AUTHORIZATION_TOKEN,
  BT_PROD_COMMENT_AUTHORIZATION_TOKEN,
  IT_ALPHA_COMMENT_AUTHORIZATION_TOKEN,
  IT_DEV_COMMENT_AUTHORIZATION_TOKEN,
  IT_PROD_COMMENT_AUTHORIZATION_TOKEN,
} from "@/config/config";

export async function POST(request: NextRequest) {
  const { url, hostName, postId, contentType } = await request.json();

  if (!url && (!hostName || !postId || !contentType)) {
    return NextResponse.json({ error: "Invalid request!" }, { status: 400 });
  }

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
        hostName: hostName,
        postid: postId,
        contenttype: contentType,
      });

      const hostUrl =
        (hostName.includes("alpha") || hostName.includes("dev")) &&
        hostName.includes("businesstoday")
          ? BT_ALPHA_COMMENTS_JSON_URL
          : (hostName.includes("alpha") || hostName.includes("dev")) &&
            hostName.includes("indiatoday")
          ? IT_ALPHA_COMMENTS_JSON_URL
          : hostName.includes("businesstoday")
          ? BT_PROD_COMMENTS_JSON_URL
          : hostName.includes("indiatoday")
          ? IT_PROD_COMMENTS_JSON_URL
          : null;

      const authorizationToken =
        hostName.includes("alpha") && hostName.includes("businesstoday")
          ? BT_ALPHA_COMMENT_AUTHORIZATION_TOKEN
          : hostName.includes("dev") && hostName.includes("businesstoday")
          ? BT_DEV_COMMENT_AUTHORIZATION_TOKEN
          : hostName.includes("alpha") && hostName.includes("indiatoday")
          ? IT_ALPHA_COMMENT_AUTHORIZATION_TOKEN
          : hostName.includes("dev") && hostName.includes("indiatoday")
          ? IT_DEV_COMMENT_AUTHORIZATION_TOKEN
          : hostName.includes("businesstoday")
          ? BT_PROD_COMMENT_AUTHORIZATION_TOKEN
          : hostName.includes("indiatoday")
          ? IT_PROD_COMMENT_AUTHORIZATION_TOKEN
          : null;

      const urlWithParams = `${hostUrl}?${params.toString()}&version=2.10`;

      response = await fetch(urlWithParams, {
        method: "GET",
        headers: {
          Authorization: `bearer ${authorizationToken}`,
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
