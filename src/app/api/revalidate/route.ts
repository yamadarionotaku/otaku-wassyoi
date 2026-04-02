import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const revalidateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("item"),
    id: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("character"),
    slug: z.string().trim().min(1),
  }),
]);

function getAuthorizationToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    console.error("Missing REVALIDATE_SECRET.");

    return NextResponse.json(
      { error: "Revalidation secret is not configured." },
      { status: 500 },
    );
  }

  if (getAuthorizationToken(request) !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const parsedBody = revalidateSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "Invalid revalidation payload.",
        issues: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const paths =
      parsedBody.data.type === "item"
        ? ["/", `/items/${parsedBody.data.id}`]
        : ["/characters", `/characters/${parsedBody.data.slug}`];

    paths.forEach((path) => {
      revalidatePath(path);
    });

    return NextResponse.json({
      revalidated: true,
      paths,
    });
  } catch (error) {
    console.error("Failed to revalidate paths.", error);

    return NextResponse.json(
      { error: "Failed to revalidate paths." },
      { status: 500 },
    );
  }
}
