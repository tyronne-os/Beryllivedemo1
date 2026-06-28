"use client";
import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { GalleryClip } from "@/app/api/matinee/gallery/route";

// ── LinkedIn share helper ────────────────────────────────────────────────────
function shareToLinkedIn(clip: GalleryClip) {
  const text = encodeURIComponent(
    `🎬 Just created "${clip.filmTitle ?? clip.title}" with Beryl Matinee AI Cinema Studio.\n\n${clip.narrativeArc ?? ""}\n\n${clip.sceneCount} scenes · ${clip.style} · ${clip.estimatedRuntime ?? ""}\n\n#BerylMatinee #AIFilm #GenerativeVideo`
  );
  const url = encodeURIComponent(clip.videoUrl ?? "https://berylize.com/matinee");
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, "_blank", "width=600,height=600");
}

type ViewMode = "grid" | "filmstrip" | "list";
type FilterMode = "all" | "films" | "clips" | "shared";

export default function MatineeGallery() {
  const [clips, setClips] = useState<GalleryClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selected, setSelected] = useState<GalleryClip|null>(null);
  const [sharing, setSharing] = useState<string|null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchClips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matinee/gallery");
      const data = await res.json();
      setClips(data.clips ?? []);
    } catch { setClips([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClips(); }, [fetchClips]);

  const handleLinkedIn = async (clip: GalleryClip) => {
    setSharing(clip.id);
    shareToLinkedIn(clip);
    // Mark as shared
    await fetch("/api/matinee/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clip.id, linkedinPost: new Date().toISOString() }),
    });
    setClips(cs => cs.map(c => c.id === clip.id ? { ...c, linkedinShared: true } : c));
    if (selected?.id === clip.id) setSelected(s => s ? { ...s, linkedinShared: true } : s);
    setSharing(null);
  };

  const filteredClips = clips.filter(c => {
    if (filter === "films") return (c.sceneCount ?? 1) > 1;
    if (filter === "clips") return (c.sceneCount ?? 1) === 1;
    if (filter === "shared") return c.linkedinShared;
    return true;
  });

  const TIER_COLOR: Record<string, string> = {
    preview: "#4CAF50", production: "#4CAF50", premium: "#c8a951", ultra: "#9de4f8"
  };

  return (
    <>
      <Nav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700;900&family=Roboto+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#07050a;overflow-x:hidden;}

        @keyframes gold-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-dot{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes card-hover{to{transform:translateY(-4px);}}
        @keyframes scan-v{0%{transform:translateY(-100%)}100%{transform:translateY(800%)}}
        @keyframes shimmer-bg{0%{background-position:200% 0}100%{background-position:-200% 0}}

        .gallery-card{
          border:1px solid rgba(200,169,81,.12);
          background:rgba(255,255,255,.025);
          cursor:pointer;
          transition:border-color .2s,transform .2s,box-shadow .2s;
          animation:fade-up .4s ease both;
          position:relative;overflow:hidden;
        }
        .gallery-card:hover{
          border-color:rgba(200,169,81,.4);
          transform:translateY(-4px);
          box-shadow:0 12px 40px rgba(0,0,0,.6),0 0 0 1px rgba(200,169,81,.08);
        }
        .gallery-card.selected{border-color:#c8a951;box-shadow:0 0 0 2px rgba(200,169,81,.25);}

        .view-btn{
          font-family:'Roboto Mono',monospace;font-size:10px;letter-spacing:1px;
          padding:6px 12px;border:1px solid rgba(255,255,255,.1);background:transparent;
          color:rgba(232,220,200,.4);cursor:pointer;transition:all .15s;
        }
        .view-btn.active{border-color:#c8a951;background:rgba(200,169,81,.1);color:#c8a951;}
        .view-btn:hover:not(.active){border-color:rgba(200,169,81,.3);color:rgba(232,220,200,.7);}

        .filter-chip{
          font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;
          padding:5px 12px;border:1px solid rgba(255,255,255,.08);background:transparent;
          color:rgba(232,220,200,.4);cursor:pointer;border-radius:20px;transition:all .15s;
        }
        .filter-chip.active{border-color:#4CAF50;background:rgba(76,175,80,.1);color:#4CAF50;}
        .filter-chip:hover:not(.active){border-color:rgba(255,255,255,.2);color:rgba(232,220,200,.75);}

        .li-btn{
          display:flex;align-items:center;gap:6px;
          font-family:'Cinzel',serif;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;
          padding:7px 14px;border:1px solid rgba(10,102,194,.4);background:rgba(10,102,194,.1);
          color:#7ab3e0;cursor:pointer;transition:all .2s;white-space:nowrap;
        }
        .li-btn:hover{border-color:#0a66c2;background:rgba(10,102,194,.2);color:#aad4f5;}
        .li-btn.shared{border-color:rgba(76,175,80,.4);background:rgba(76,175,80,.1);color:#4CAF50;}

        .skeleton{
          background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);
          background-size:400% 100%;animation:shimmer-bg 1.5s infinite;
        }

        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
        ::-webkit-scrollbar-thumb{background:rgba(200,169,81,.3);border-radius:2px}

        .modal-backdrop{
          position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);
          z-index:1000;display:flex;align-items:center;justify-content:center;
          animation:fade-up .2s ease;
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#07050a", paddingTop:64 }}>

        {/* ── HERO HEADER ── */}
        <div style={{
          borderBottom:"1px solid rgba(200,169,81,.1)",
          background:"linear-gradient(180deg,rgba(10,20,10,.9) 0%,rgba(7,5,10,.95) 100%)",
          padding:"36px 40px 28px",
        }}>
          <div style={{ maxWidth:1400, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  <Link href="/matinee" style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:3,
                    color:"rgba(232,220,200,.35)", textDecoration:"none", textTransform:"uppercase" }}>
                    ← Matinee
                  </Link>
                  <span style={{ color:"rgba(255,255,255,.15)" }}>·</span>
                  <Link href="/matinee/studio" style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:3,
                    color:"rgba(232,220,200,.35)", textDecoration:"none", textTransform:"uppercase" }}>
                    Studio
                  </Link>
                </div>
                <h1 style={{
                  fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(1.6rem,3vw,2.6rem)",
                  fontWeight:900, letterSpacing:4,
                  background:"linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
                  backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text", animation:"gold-shimmer 4s linear infinite",
                }}>
                  PRODUCTION VAULT
                </h1>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, color:"rgba(232,220,200,.4)",
                  letterSpacing:3, marginTop:8, textTransform:"uppercase" }}>
                  {clips.length} saved · {clips.filter(c=>c.linkedinShared).length} shared · HuggingFace storage
                </p>
              </div>

              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                {/* View toggle */}
                <div style={{ display:"flex", gap:4 }}>
                  {([["grid","⊞"],["filmstrip","⊟"],["list","≡"]] as [ViewMode,string][]).map(([v,icon])=>(
                    <button key={v} className={`view-btn${view===v?" active":""}`} onClick={()=>setView(v)}>{icon}</button>
                  ))}
                </div>
                <Link href="/matinee/studio" style={{
                  fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:2, textTransform:"uppercase",
                  padding:"8px 20px",
                  background:"linear-gradient(135deg,#1a4a1a,#2d7a2d,#4CAF50)",
                  color:"#fff", border:"none", textDecoration:"none", display:"block",
                }}>
                  + New Film
                </Link>
              </div>
            </div>

            {/* Filter chips */}
            <div style={{ display:"flex", gap:8, marginTop:20, flexWrap:"wrap" }}>
              {([["all","All Productions"],["films","Multi-Scene Films"],["clips","Single Clips"],["shared","Shared to LinkedIn"]] as [FilterMode,string][]).map(([f,label])=>(
                <button key={f} className={`filter-chip${filter===f?" active":""}`} onClick={()=>setFilter(f)}>
                  {label} {f==="all" ? `(${clips.length})` : f==="films" ? `(${clips.filter(c=>c.sceneCount>1).length})` : f==="clips" ? `(${clips.filter(c=>c.sceneCount<=1).length})` : `(${clips.filter(c=>c.linkedinShared).length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── GALLERY BODY ── */}
        <div style={{ maxWidth:1400, margin:"0 auto", padding:"32px 40px 80px" }}>

          {loading ? (
            // Skeleton
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
              {[...Array(6)].map((_,i)=>(
                <div key={i} className="skeleton" style={{ height:220, borderRadius:2 }}/>
              ))}
            </div>

          ) : filteredClips.length === 0 ? (
            <div style={{ textAlign:"center", padding:"100px 20px" }}>
              <div style={{ fontSize:48, marginBottom:20, opacity:.2 }}>🎬</div>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:18, color:"rgba(232,220,200,.2)",
                letterSpacing:3, marginBottom:12 }}>
                VAULT IS EMPTY
              </div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:"rgba(232,220,200,.25)",
                letterSpacing:2, lineHeight:2, marginBottom:32 }}>
                {filter==="all"
                  ? "Go to the Studio, tell Vera your vision,\nand save your first production."
                  : `No ${filter} yet.`}
              </div>
              <Link href="/matinee/studio" style={{
                fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:3, textTransform:"uppercase",
                padding:"12px 32px",
                background:"linear-gradient(135deg,#1a4a1a,#4CAF50)",
                color:"#fff", textDecoration:"none", display:"inline-block",
              }}>
                Open Studio →
              </Link>
            </div>

          ) : view === "grid" ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
              {filteredClips.map((clip, i) => (
                <div key={clip.id} className={`gallery-card${selected?.id===clip.id?" selected":""}`}
                  style={{ animationDelay:`${i*0.05}s` }}
                  onClick={()=>setSelected(clip)}>
                  {/* Thumbnail */}
                  <div style={{
                    height:160, position:"relative", overflow:"hidden",
                    background: clip.thumbnail
                      ? `url(${clip.thumbnail}) center/cover`
                      : "linear-gradient(135deg,rgba(10,30,10,.8),rgba(7,5,10,.95))",
                  }}>
                    {!clip.thumbnail && (
                      <div style={{ position:"absolute", inset:0, display:"flex",
                        alignItems:"center", justifyContent:"center",
                        fontFamily:"'Cinzel Decorative',serif", fontSize:28,
                        color:"rgba(200,169,81,.15)", letterSpacing:4 }}>
                        🎬
                      </div>
                    )}
                    {clip.videoUrl && (
                      <div style={{ position:"absolute", inset:0, display:"flex",
                        alignItems:"center", justifyContent:"center" }}>
                        <div style={{
                          width:44, height:44, borderRadius:"50%",
                          background:"rgba(0,0,0,.55)", backdropFilter:"blur(8px)",
                          border:"1px solid rgba(200,169,81,.3)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:16, color:"#c8a951",
                        }}>▶</div>
                      </div>
                    )}
                    {/* Badges */}
                    <div style={{ position:"absolute", top:8, left:8, display:"flex", gap:6 }}>
                      <span style={{
                        fontFamily:"'Roboto Mono',monospace", fontSize:7, letterSpacing:1,
                        padding:"3px 7px", background:"rgba(0,0,0,.7)",
                        border:`1px solid ${TIER_COLOR[clip.tier]??'#c8a951'}44`,
                        color: TIER_COLOR[clip.tier]??'#c8a951', textTransform:"uppercase",
                      }}>{clip.tier}</span>
                      {clip.sceneCount > 1 && (
                        <span style={{
                          fontFamily:"'Roboto Mono',monospace", fontSize:7, letterSpacing:1,
                          padding:"3px 7px", background:"rgba(0,0,0,.7)",
                          border:"1px solid rgba(200,169,81,.2)", color:"rgba(200,169,81,.7)",
                        }}>{clip.sceneCount} SCENES</span>
                      )}
                    </div>
                    {clip.linkedinShared && (
                      <div style={{ position:"absolute", top:8, right:8,
                        fontFamily:"'Roboto Mono',monospace", fontSize:7,
                        padding:"3px 7px", background:"rgba(10,102,194,.5)",
                        border:"1px solid rgba(10,102,194,.6)", color:"#aad4f5" }}>
                        SHARED
                      </div>
                    )}
                    {/* Scan line */}
                    <div style={{ position:"absolute", left:0, right:0, height:1,
                      background:"rgba(255,255,255,.04)", animation:"scan-v 6s linear infinite" }}/>
                  </div>

                  {/* Info */}
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700,
                      color:"#E8DCC8", marginBottom:4, lineHeight:1.3 }}>
                      {clip.filmTitle ?? clip.title}
                    </div>
                    {clip.narrativeArc && (
                      <div style={{ fontFamily:"'Roboto Mono',monospace", fontSize:9,
                        color:"rgba(232,220,200,.4)", lineHeight:1.6, marginBottom:8,
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                        overflow:"hidden" }}>
                        {clip.narrativeArc}
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontFamily:"'Roboto Mono',monospace", fontSize:8,
                        color:"rgba(232,220,200,.25)", letterSpacing:1 }}>
                        {new Date(clip.createdAt).toLocaleDateString()}
                        {clip.estimatedRuntime ? ` · ${clip.estimatedRuntime}` : ""}
                      </span>
                      <button className={`li-btn${clip.linkedinShared?" shared":""}`}
                        onClick={e=>{ e.stopPropagation(); handleLinkedIn(clip); }}
                        disabled={sharing===clip.id}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        {clip.linkedinShared ? "Shared" : sharing===clip.id ? "…" : "Share"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : view === "filmstrip" ? (
            // Filmstrip view
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {filteredClips.map((clip, i) => (
                <div key={clip.id} className={`gallery-card${selected?.id===clip.id?" selected":""}`}
                  style={{ display:"flex", gap:0, animationDelay:`${i*0.04}s`, minHeight:110 }}
                  onClick={()=>setSelected(clip)}>
                  {/* Thumbnail strip */}
                  <div style={{
                    width:180, flexShrink:0,
                    background: clip.thumbnail
                      ? `url(${clip.thumbnail}) center/cover`
                      : "linear-gradient(135deg,rgba(10,30,10,.8),rgba(7,5,10,.95))",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    position:"relative", overflow:"hidden",
                  }}>
                    {!clip.thumbnail && <span style={{ fontSize:24, opacity:.2 }}>🎬</span>}
                    {clip.videoUrl && (
                      <div style={{
                        width:36, height:36, borderRadius:"50%",
                        background:"rgba(0,0,0,.6)", border:"1px solid rgba(200,169,81,.3)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:12, color:"#c8a951",
                      }}>▶</div>
                    )}
                    <div style={{ position:"absolute", left:0, right:0, height:1,
                      background:"rgba(255,255,255,.04)", animation:"scan-v 5s linear infinite" }}/>
                  </div>

                  <div style={{ flex:1, padding:"16px 20px", borderLeft:"1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700,
                          color:"#E8DCC8", marginBottom:6 }}>
                          {clip.filmTitle ?? clip.title}
                        </div>
                        {clip.narrativeArc && (
                          <div style={{ fontFamily:"'Roboto Mono',monospace", fontSize:9,
                            color:"rgba(232,220,200,.4)", lineHeight:1.7, maxWidth:520 }}>
                            {clip.narrativeArc}
                          </div>
                        )}
                      </div>
                      <button className={`li-btn${clip.linkedinShared?" shared":""}`}
                        onClick={e=>{ e.stopPropagation(); handleLinkedIn(clip); }}
                        disabled={sharing===clip.id} style={{ flexShrink:0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        {clip.linkedinShared ? "Shared" : sharing===clip.id ? "…" : "Share to LinkedIn"}
                      </button>
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:12, flexWrap:"wrap" }}>
                      {[
                        { label:"TIER", val:clip.tier, color:TIER_COLOR[clip.tier]??"#c8a951" },
                        { label:"STYLE", val:clip.style, color:"rgba(232,220,200,.5)" },
                        { label:"SCENES", val:String(clip.sceneCount), color:"#c8a951" },
                        ...(clip.estimatedRuntime ? [{ label:"RUNTIME", val:clip.estimatedRuntime, color:"rgba(232,220,200,.5)" }] : []),
                        ...(clip.colorGrade ? [{ label:"GRADE", val:clip.colorGrade, color:"rgba(157,228,248,.7)" }] : []),
                      ].map(({label,val,color})=>(
                        <div key={label} style={{ fontFamily:"'Roboto Mono',monospace", fontSize:8,
                          color:"rgba(232,220,200,.3)", letterSpacing:1 }}>
                          <span>{label}</span>{" "}
                          <span style={{ color }}>{val}</span>
                        </div>
                      ))}
                      <div style={{ marginLeft:"auto", fontFamily:"'Roboto Mono',monospace", fontSize:8,
                        color:"rgba(232,220,200,.2)" }}>
                        {new Date(clip.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : (
            // List view
            <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 80px 120px",
                padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,.06)",
                fontFamily:"'Roboto Mono',monospace", fontSize:8, letterSpacing:2,
                color:"rgba(200,169,81,.5)", textTransform:"uppercase" }}>
                <span>Title</span><span>Tier</span><span>Style</span>
                <span>Scenes</span><span>Runtime</span><span>Actions</span>
              </div>
              {filteredClips.map((clip, i)=>(
                <div key={clip.id}
                  style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 80px 120px",
                    padding:"12px 16px", cursor:"pointer", transition:"background .15s",
                    background:selected?.id===clip.id?"rgba(200,169,81,.06)":"transparent",
                    borderBottom:"1px solid rgba(255,255,255,.03)",
                    animation:`fade-up .3s ${i*0.03}s both ease`,
                  }}
                  onClick={()=>setSelected(clip)}>
                  <div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:"#E8DCC8", marginBottom:2 }}>
                      {clip.filmTitle ?? clip.title}
                    </div>
                    {clip.narrativeArc && (
                      <div style={{ fontFamily:"'Roboto Mono',monospace", fontSize:8,
                        color:"rgba(232,220,200,.3)", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:320 }}>
                        {clip.narrativeArc}
                      </div>
                    )}
                  </div>
                  <span style={{ fontFamily:"'Roboto Mono',monospace", fontSize:9,
                    color:TIER_COLOR[clip.tier]??"#c8a951", alignSelf:"center" }}>{clip.tier}</span>
                  <span style={{ fontFamily:"'Roboto Mono',monospace", fontSize:9,
                    color:"rgba(232,220,200,.4)", alignSelf:"center" }}>{clip.style}</span>
                  <span style={{ fontFamily:"'Roboto Mono',monospace", fontSize:9,
                    color:"#c8a951", alignSelf:"center" }}>{clip.sceneCount}</span>
                  <span style={{ fontFamily:"'Roboto Mono',monospace", fontSize:9,
                    color:"rgba(232,220,200,.35)", alignSelf:"center" }}>
                    {clip.estimatedRuntime ?? "—"}
                  </span>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <button className={`li-btn${clip.linkedinShared?" shared":""}`}
                      onClick={e=>{ e.stopPropagation(); handleLinkedIn(clip); }}
                      disabled={sharing===clip.id} style={{ padding:"4px 8px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      {clip.linkedinShared?"✓":"in"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div className="modal-backdrop" onClick={()=>setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:"rgba(10,12,18,.97)", border:"1px solid rgba(200,169,81,.2)",
            width:"min(680px,92vw)", maxHeight:"88vh", overflowY:"auto",
            boxShadow:"0 40px 120px rgba(0,0,0,.9)",
          }}>
            {/* Modal header */}
            <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,.06)",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:16, fontWeight:900,
                  background:"linear-gradient(135deg,#8B6914,#c8a951,#f5e070)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text", letterSpacing:2 }}>
                  {selected.filmTitle ?? selected.title}
                </div>
                <div style={{ fontFamily:"'Roboto Mono',monospace", fontSize:8,
                  color:"rgba(232,220,200,.3)", marginTop:4, letterSpacing:1 }}>
                  {new Date(selected.createdAt).toLocaleString()} · {selected.sceneCount} scenes · {selected.tier} tier
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{
                background:"none", border:"none", color:"rgba(232,220,200,.4)",
                fontSize:20, cursor:"pointer", padding:"4px 8px",
              }}>✕</button>
            </div>

            {/* Preview area */}
            <div style={{ background:"#000", height:200, display:"flex",
              alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              {selected.videoUrl ? (
                <video src={selected.videoUrl} controls style={{ maxHeight:"100%", maxWidth:"100%" }}/>
              ) : (
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:36, opacity:.2, marginBottom:12 }}>🎬</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:10,
                    color:"rgba(232,220,200,.2)", letterSpacing:2 }}>
                    No video URL saved
                  </div>
                </div>
              )}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:24, background:"#000" }}/>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:24, background:"#000" }}/>
            </div>

            {/* Details */}
            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
              {selected.narrativeArc && (
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:3,
                    color:"rgba(200,169,81,.5)", textTransform:"uppercase", marginBottom:8 }}>
                    Narrative Arc
                  </div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:"rgba(232,220,200,.75)",
                    lineHeight:1.8, fontStyle:"italic" }}>
                    "{selected.narrativeArc}"
                  </div>
                </div>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  { label:"Style", val:selected.style },
                  { label:"Tier", val:selected.tier, color:TIER_COLOR[selected.tier] },
                  { label:"Scenes", val:String(selected.sceneCount) },
                  { label:"Runtime", val:selected.estimatedRuntime ?? "—" },
                  { label:"Color Grade", val:selected.colorGrade ?? "—" },
                  { label:"Genre", val:selected.genre ?? "—" },
                ].map(({label,val,color})=>(
                  <div key={label} style={{ background:"rgba(255,255,255,.03)",
                    border:"1px solid rgba(255,255,255,.06)", padding:"10px 14px" }}>
                    <div style={{ fontFamily:"'Roboto Mono',monospace", fontSize:7,
                      color:"rgba(200,169,81,.5)", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>
                      {label}
                    </div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:11,
                      color: color ?? "rgba(232,220,200,.7)" }}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>

              {selected.editorialNote && (
                <div style={{ background:"rgba(76,175,80,.06)", border:"1px solid rgba(76,175,80,.15)",
                  padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Roboto Mono',monospace", fontSize:7,
                    color:"rgba(76,175,80,.6)", letterSpacing:2, marginBottom:6 }}>
                    EDITOR'S NOTE
                  </div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:11,
                    color:"rgba(232,220,200,.65)", lineHeight:1.8, fontStyle:"italic" }}>
                    "{selected.editorialNote}"
                  </div>
                </div>
              )}

              {/* LinkedIn share */}
              <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:16 }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:3,
                  color:"rgba(200,169,81,.5)", textTransform:"uppercase", marginBottom:10 }}>
                  Share to LinkedIn
                </div>
                <div style={{ fontFamily:"'Roboto Mono',monospace", fontSize:9,
                  color:"rgba(232,220,200,.35)", lineHeight:1.8, marginBottom:12,
                  background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)",
                  padding:"10px 12px" }}>
                  🎬 Just created "{selected.filmTitle ?? selected.title}" with Beryl Matinee AI Cinema Studio.{"\n\n"}
                  {selected.narrativeArc ?? ""}{"\n\n"}
                  {selected.sceneCount} scenes · {selected.style} · {selected.estimatedRuntime ?? ""}{"\n\n"}
                  #BerylMatinee #AIFilm #GenerativeVideo
                </div>
                <button className={`li-btn${selected.linkedinShared?" shared":""}`}
                  onClick={()=>handleLinkedIn(selected)} disabled={sharing===selected.id}
                  style={{ width:"100%", justifyContent:"center", padding:"12px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  {selected.linkedinShared
                    ? "✓ Shared — Share Again"
                    : sharing===selected.id ? "Opening LinkedIn…"
                    : "Post to LinkedIn"}
                </button>
                {selected.linkedinShared && (
                  <div style={{ fontFamily:"'Roboto Mono',monospace", fontSize:8,
                    color:"rgba(76,175,80,.6)", textAlign:"center", marginTop:8, letterSpacing:1 }}>
                    ✓ Previously shared to LinkedIn
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {saveMsg && (
        <div style={{ position:"fixed", bottom:32, right:32, zIndex:2000,
          background:"rgba(76,175,80,.15)", border:"1px solid rgba(76,175,80,.4)",
          padding:"12px 20px", fontFamily:"'Cinzel',serif", fontSize:10,
          letterSpacing:2, color:"#4CAF50" }}>
          {saveMsg}
        </div>
      )}
    </>
  );
}
