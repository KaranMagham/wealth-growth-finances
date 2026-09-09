import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "An image is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "Image must be smaller than 2 MB" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const image = `data:${file.type};base64,${bytes.toString("base64")}`;

    await auth.api.updateUser({
      headers: request.headers,
      body: { image },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile image update failed:", error);
    return NextResponse.json(
      { message: "Unable to update profile image" },
      { status: 500 }
    );
  }
}
