import { NextResponse } from "next/server";

export async function GET() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
  const sheetId = process.env.GOOGLE_SHEET_ID || "";
  const raw = process.env.GOOGLE_PRIVATE_KEY || "";

  let decodedLooksLikePem = false;
  let decodeError = null;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    decodedLooksLikePem = decoded.includes("BEGIN PRIVATE KEY");
  } catch (e) {
    decodeError = e.message;
  }

  return NextResponse.json({
    hasEmail: !!email,
    emailEndsCorrectly: email.endsWith("gserviceaccount.com"),
    hasSheetId: !!sheetId,
    sheetIdLength: sheetId.length,
    rawKeyLength: raw.length,
    rawLooksLikeRawPem: raw.includes("BEGIN PRIVATE KEY"),
    base64DecodedLooksLikePem: decodedLooksLikePem,
    decodeError,
  });
}
