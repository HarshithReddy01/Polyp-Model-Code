import { useRef, useState, useCallback, useEffect, DragEvent, ChangeEvent } from "react";

const API_BASE = "https://harshithreddy01-polyp-detection.hf.space";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_MB = 10;

type ModelName = "Kvasir-Seg" | "BKAI-IGH";

type State =
  | { stage: "idle" }
  | { stage: "loading" }
  | { stage: "error"; message: string }
  | { stage: "result"; originalURL: string; maskURL: string; model: ModelName };

const MODEL_INFO: Record<ModelName, { title: string; description: string }> = {
  "Kvasir-Seg": {
    title: "Kvasir-SEG",
    description:
      "Trained on 1,000 annotated colonoscopy images covering a wide variety of polyp shapes, sizes, and textures. Best choice for general-purpose polyp detection in standard colonoscopy footage.",
  },
  "BKAI-IGH": {
    title: "BKAI-IGH",
    description:
      "Trained on a clinically diverse dataset that distinguishes between neoplastic and non-neoplastic polyp categories. Recommended when finer discrimination between polyp types is needed.",
  },
};

function validate(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Invalid file type. Please upload a JPEG or PNG colonoscopy image. X-rays, CT scans, MRI, regular photos, and other formats are not supported by this model.";
  if (file.size > MAX_MB * 1024 * 1024)
    return `File too large. Maximum allowed size is ${MAX_MB} MB.`;
  return null;
}

function UploadIcon() {
  return (
    <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Overlay({ originalURL, maskURL }: { originalURL: string; maskURL: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const orig = new Image();
    const mask = new Image();
    let loaded = 0;

    const tryDraw = () => {
      loaded++;
      if (loaded < 2) return;
      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(orig, 0, 0, 256, 256);
      const off = document.createElement("canvas");
      off.width = 256;
      off.height = 256;
      const octx = off.getContext("2d")!;
      octx.drawImage(mask, 0, 0, 256, 256);
      const maskPx = octx.getImageData(0, 0, 256, 256);
      const base = ctx.getImageData(0, 0, 256, 256);
      for (let i = 0; i < maskPx.data.length; i += 4) {
        if (maskPx.data[i] > 128) {
          base.data[i]     = Math.min(255, base.data[i] + 90);
          base.data[i + 1] = Math.max(0,   base.data[i + 1] - 50);
          base.data[i + 2] = Math.max(0,   base.data[i + 2] - 50);
        }
      }
      ctx.putImageData(base, 0, 0);
    };

    orig.onload = tryDraw;
    mask.onload = tryDraw;
    orig.src = originalURL;
    mask.src = maskURL;
  }, [originalURL, maskURL]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", aspectRatio: "1", display: "block", background: "#f1f3f6" }}
    />
  );
}

export default function App() {
  const [state, setState] = useState<State>({ stage: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelName>("Kvasir-Seg");
  const inputRef = useRef<HTMLInputElement>(null);

  const run = useCallback(async (file: File, model: ModelName) => {
    const err = validate(file);
    if (err) { setState({ stage: "error", message: err }); return; }

    const originalURL = URL.createObjectURL(file);
    setState({ stage: "loading" });

    const form = new FormData();
    form.append("file", file);

    try {
      const resp = await fetch(`${API_BASE}/predict?model=${encodeURIComponent(model)}`, {
        method: "POST",
        body: form,
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? `Server error (${resp.status})`);
      }
      const data = await resp.json() as { mask: string };
      const maskURL = "data:image/png;base64," + data.mask;
      setState({ stage: "result", originalURL, maskURL, model });
    } catch (e) {
      setState({ stage: "error", message: (e as Error).message });
    }
  }, []);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) run(file, selectedModel);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) run(file, selectedModel);
  };

  const reset = () => {
    setState({ stage: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      <header style={{
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        padding: "18px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em" }}>
            Polyp Detection
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
            AI-powered colonoscopy polyp segmentation
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Technical Lead &mdash;{" "}
            <a href="https://debeshjha.com" target="_blank" rel="noopener" style={linkStyle}>
              Debesh Jha
            </a>
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            AI/ML Engineer &mdash;{" "}
            <a href="https://harshithreddy01.github.io/My-Web/" target="_blank" rel="noopener" style={linkStyle}>
              Harshith Reddy Nalla
            </a>
          </span>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        <div style={{
          background: "var(--accent-light)",
          border: "1px solid #bfdbfe",
          borderRadius: "var(--radius)",
          padding: "16px 20px",
          fontSize: "0.875rem",
          color: "#1e40af",
          lineHeight: 1.65,
        }}>
          <strong style={{ display: "block", marginBottom: 6, fontSize: "0.9rem" }}>What images to upload</strong>
          This model is trained on <strong>colonoscopy and endoscopy images</strong> for detecting colorectal polyps.
          Upload only images captured by a colonoscope showing the inner colon wall.
          <ul style={{ paddingLeft: 18, marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>Real <strong>colonoscopy / GI endoscopy</strong> frames — JPEG or PNG</li>
            <li>Image must show the <strong>inner colon / bowel wall</strong></li>
            <li><strong>Do not upload:</strong> regular photos, X-rays, CT scans, MRI, ultrasound, or screenshots</li>
            <li>Wrong uploads will be rejected — results on non-colonoscopy images are meaningless</li>
          </ul>
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 12 }}>Select Model</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(Object.keys(MODEL_INFO) as ModelName[]).map((key) => {
              const active = selectedModel === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedModel(key)}
                  style={{
                    background: active ? "var(--accent-light)" : "#fff",
                    border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    padding: "14px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: active ? "var(--accent)" : "var(--text)",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: "50%",
                      border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent)" : "transparent",
                      display: "inline-block",
                      flexShrink: 0,
                    }} />
                    {MODEL_INFO[key].title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.55 }}>
                    {MODEL_INFO[key].description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {state.stage !== "result" && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              background: dragOver ? "var(--accent-light)" : "#fff",
              border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              padding: "52px 24px",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "var(--accent-light)", color: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <UploadIcon />
            </div>
            <div style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 6 }}>
              Drop a colonoscopy image here
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 18 }}>
              or click to browse — JPEG / PNG only
            </div>
            <div style={{
              display: "inline-block",
              padding: "9px 24px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}>
              Choose File
            </div>
          </div>
        )}

        {state.stage === "error" && (
          <div style={{
            background: "var(--red-light)",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius)",
            padding: "14px 18px",
            fontSize: "0.875rem",
            color: "var(--red)",
            fontWeight: 500,
          }}>
            {state.message}
          </div>
        )}

        {state.stage === "loading" && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 12, padding: 20,
            background: "#fff", border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: "0.875rem", color: "var(--muted)", fontWeight: 500,
          }}>
            <div style={{
              width: 20, height: 20,
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }} />
            Running segmentation with {MODEL_INFO[selectedModel].title}…
          </div>
        )}

        {state.stage === "result" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>Segmentation Results</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
                  Model: {MODEL_INFO[state.model].title}
                </div>
              </div>
              <button
                onClick={reset}
                style={{
                  background: "none", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "7px 16px",
                  fontSize: "0.8rem", fontWeight: 600, color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                Upload another
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <Panel label="Original Image">
                <img src={state.originalURL} alt="Original" style={imgStyle} />
              </Panel>
              <Panel label="Predicted Mask">
                <img src={state.maskURL} alt="Mask" style={imgStyle} />
              </Panel>
              <Panel label="Overlay">
                <Overlay originalURL={state.originalURL} maskURL={state.maskURL} />
              </Panel>
            </div>
          </div>
        )}

      </main>

      <footer style={{
        textAlign: "center", padding: "18px 20px",
        fontSize: "0.75rem", color: "var(--muted)",
        borderTop: "1px solid var(--border)",
      }}>
        RUPNet &mdash; Trained on Kvasir-SEG &amp; BKAI-IGH
      </footer>
    </div>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "9px 14px",
        fontSize: "0.72rem", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.06em",
        color: "var(--muted)", borderBottom: "1px solid var(--border)",
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--accent)",
  textDecoration: "none",
};

const imgStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "1",
  objectFit: "contain",
  display: "block",
  background: "#f1f3f6",
};
