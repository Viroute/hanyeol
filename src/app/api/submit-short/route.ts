import { NextResponse } from "next/server";
import { ShortAnswersSchema, scoreShort } from "@/lib/shortSurvey";
import { supabase } from "@/lib/supabase";

function uid() {
  return crypto.randomUUID();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ShortAnswersSchema.safeParse(body?.answers);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const answers = parsed.data;
  const { ch, dd, type_code } = scoreShort(answers);

  const id = uid();
  const { error } = await supabase.from("surveys").insert({
    id,
    version: "short",
    ch,
    dd,
    type_code,
    answers,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}
