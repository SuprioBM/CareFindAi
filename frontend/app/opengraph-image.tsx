import { ImageResponse } from "next/og";
import Image from "next/image";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        <Image src="/og-image.png" alt="CareFind Logo" width={200} height={200} style={{ marginRight: 20 }} />
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    }
  );
}
