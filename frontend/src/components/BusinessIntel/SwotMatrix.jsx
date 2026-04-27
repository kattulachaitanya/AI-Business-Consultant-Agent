import React from "react";

const quadrantColors = {
  strengths: "rgba(76, 175, 80, 0.12)",
  weaknesses: "rgba(244, 67, 54, 0.12)",
  opportunities: "rgba(33, 150, 243, 0.12)",
  threats: "rgba(255, 152, 0, 0.12)",
};

const boxStyle = (type) => ({
  background: quadrantColors[type],
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "16px",
  minHeight: "180px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
});

const titleStyle = {
  fontSize: "1rem",
  fontWeight: 700,
  marginBottom: "10px",
};

const listStyle = {
  margin: 0,
  paddingLeft: "18px",
  lineHeight: 1.6,
};

const safeList = (items, fallback) =>
  Array.isArray(items) && items.length > 0 ? items : fallback;

const SwotMatrix = ({ swot }) => {
  const strengths = safeList(swot?.strengths, ["Strong positioning potential"]);
  const weaknesses = safeList(swot?.weaknesses, ["Execution uncertainty"]);
  const opportunities = safeList(swot?.opportunities, ["Market expansion potential"]);
  const threats = safeList(swot?.threats, ["Competitive pressure"]);

  return (
    <div
      style={{
        marginTop: "18px",
        padding: "18px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "6px" }}>
        🧠 SWOT Analysis
      </div>
      <div style={{ opacity: 0.75, marginBottom: "16px", fontSize: "0.9rem" }}>
        Strategic internal and external assessment
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "14px",
        }}
      >
        <div style={boxStyle("strengths")}>
          <div style={titleStyle}>Strengths</div>
          <ul style={listStyle}>
            {strengths.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={boxStyle("weaknesses")}>
          <div style={titleStyle}>Weaknesses</div>
          <ul style={listStyle}>
            {weaknesses.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={boxStyle("opportunities")}>
          <div style={titleStyle}>Opportunities</div>
          <ul style={listStyle}>
            {opportunities.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={boxStyle("threats")}>
          <div style={titleStyle}>Threats</div>
          <ul style={listStyle}>
            {threats.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SwotMatrix;