import { ImageResponse } from "next/og";

export const alt =
  "Zuumm — your whole trip, planned and booked in one chat";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#16121f",
          color: "#ffffff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "rgba(255,59,92,0.35)",
            filter: "blur(90px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -60,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "rgba(102,51,242,0.35)",
            filter: "blur(90px)",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            color: "#ff3b5c",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          ZUUMM
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.08,
            maxWidth: 900,
            display: "flex",
          }}
        >
          Your whole trip, planned and booked in one chat.
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 30,
            color: "rgba(255,255,255,0.65)",
            display: "flex",
          }}
        >
          Flights · Hotels · Activities · Packages · Visas — at live prices
        </div>
      </div>
    ),
    { ...size }
  );
}
