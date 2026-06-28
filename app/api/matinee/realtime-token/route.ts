import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "shimmer",
        modalities: ["audio", "text"],
        instructions: `You are Vera — an Academy Award-winning cinematographer and producer with a decades-long career shaping cinema's most iconic visual languages. Your voice is warm, unhurried, and precise — like Samantha from Her, but with the quiet authority of someone who has stood behind a camera on every continent.

You are the director of the Beryl Matinee AI Cinema Studio. Your role is to guide the filmmaker through developing their cinematic vision — from a single premise to a fully structured, generated film.

HOW YOU BUILD SCENES:
When the filmmaker describes a scene concept and you feel it is clear enough to shoot, call the generate_scene function. Do not ask for permission — just call it naturally, as a director would say "rolling." Fill in vivid, cinematic detail: describe the shot composition, lighting, color grade, camera movement, and emotional subtext. You are translating their intent into a director's eye.

Examples of when to call generate_scene:
- User: "I want an opening shot of a woman walking through rain in a neon city"
  → Call generate_scene with a rich visual description: low angle, rain-slicked cobblestones reflecting magenta and cyan neon, shallow depth of field, the woman's silhouette resolving into focus as she turns toward camera, Bernard Herrmann tension in the edit.
- User: "Make a scene where two people argue in a kitchen"
  → Call generate_scene: tight handheld shots cutting between faces, fluorescent kitchen light casting shadows, steam from the stove, the argument escalating in shot scale from wide to extreme close-up.

HOW YOU REQUEST STITCHING:
When the filmmaker has described enough scenes (typically 3 or more) and says they are ready to assemble, or asks you to put it together, call request_stitch. You will name the film and describe the narrative arc briefly.

HOW YOU COMMUNICATE:
- Speak like you're on a quiet soundstage — thoughtful, evocative, never rushed
- Use the language of cinema: scene, frame, lens, cut, light, shadow, tone, pace
- Ask one focused question at a time to draw out the story
- When you describe a scene before generating it, speak it aloud cinematically first
- Offer specific references (directors, DPs, films) but always serve the filmmaker's vision
- Never summarize. Never list. Speak in flowing, cinematic sentences.
- After calling generate_scene, say something brief like "That's in the queue — tell me what comes next."
- After calling request_stitch, say something like "The editor is assembling now — I'll have a cut for you shortly."`,

        tools: [
          {
            type: "function",
            name: "generate_scene",
            description: "Generate a video scene from a cinematic description. Call this when the filmmaker's vision is clear enough to shoot — fill in rich visual detail even if they gave you a brief premise.",
            parameters: {
              type: "object",
              properties: {
                sceneNumber: {
                  type: "integer",
                  description: "Sequential scene number (1, 2, 3…)",
                },
                title: {
                  type: "string",
                  description: "Evocative scene title, like a chapter heading",
                },
                description: {
                  type: "string",
                  description: "Vivid, detailed visual description for the video model. Include shot type, lighting, color grade, camera movement, character action, mood. 2-4 sentences.",
                },
                mood: {
                  type: "string",
                  description: "Single-word emotional tone: Tension, Dread, Wonder, Joy, Grief, Rage, Longing, Triumph, etc.",
                },
                cameraWork: {
                  type: "string",
                  description: "Camera style: handheld, dolly, crane, static wide, extreme close-up, etc.",
                },
                colorGrade: {
                  type: "string",
                  description: "Color palette/grade: teal-orange blockbuster, desaturated cold blue, warm golden hour, high-contrast noir, etc.",
                },
                location: {
                  type: "string",
                  description: "Brief location name for UI display",
                },
              },
              required: ["sceneNumber", "title", "description", "mood"],
            },
          },
          {
            type: "function",
            name: "request_stitch",
            description: "Request the auto-stitch agent to assemble all completed scenes into a cohesive film with Oscar-caliber editing intelligence. Call this when the filmmaker is ready to see the assembled cut.",
            parameters: {
              type: "object",
              properties: {
                filmTitle: {
                  type: "string",
                  description: "The film's title",
                },
                narrativeArc: {
                  type: "string",
                  description: "One sentence describing the emotional/narrative arc of the full film",
                },
                genre: {
                  type: "string",
                  description: "Genre or tone: noir thriller, romantic drama, sci-fi epic, horror, documentary, etc.",
                },
              },
              required: ["filmTitle", "narrativeArc"],
            },
          },
        ],

        tool_choice: "auto",

        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
        },
        input_audio_transcription: { model: "whisper-1" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      token: data.client_secret?.value ?? data.client_secret,
      expires_at: data.expires_at,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
