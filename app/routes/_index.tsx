import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div
      style={{
        width: "100svw",
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
        color: "#ffffff",
        fontFamily:
          '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "600px",
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "700",
            marginBottom: "16px",
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Falcare Racing
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: "40px",
            lineHeight: "1.6",
          }}
        >
          드리프트 레이싱 게임에 오신 것을 환영합니다.
          <br />
          최고의 랩 타임을 기록하세요!
        </p>

        <Link
          to="/play"
          style={{
            display: "inline-block",
            padding: "16px 32px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#ffffff",
            background:
              "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
            borderRadius: "12px",
            textDecoration: "none",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            boxShadow: "0 4px 16px rgba(96, 165, 250, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(96, 165, 250, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(96, 165, 250, 0.3)";
          }}
        >
          게임 시작
        </Link>

        <div
          style={{
            marginTop: "60px",
            paddingTop: "40px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              조작 방법:
            </strong>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              textAlign: "left",
            }}
          >
            <div>
              <span style={{ color: "#60a5fa" }}>I</span> - 전진
            </div>
            <div>
              <span style={{ color: "#60a5fa" }}>K</span> - 후진
            </div>
            <div>
              <span style={{ color: "#60a5fa" }}>J</span> - 좌회전
            </div>
            <div>
              <span style={{ color: "#60a5fa" }}>L</span> - 우회전
            </div>
            <div>
              <span style={{ color: "#60a5fa" }}>D</span> - 드리프트
            </div>
            <div>
              <span style={{ color: "#60a5fa" }}>Space</span> - 점프
            </div>
            <div>
              <span style={{ color: "#60a5fa" }}>R</span> - 리셋
            </div>
            <div>
              <span style={{ color: "#60a5fa" }}>ESC</span> - 종료
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
