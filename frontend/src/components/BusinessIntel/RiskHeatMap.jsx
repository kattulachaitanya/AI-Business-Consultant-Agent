import React from "react";

const levels = ["Low", "Medium", "High"];

const getCellColor = (likelihood, impact) => {
  const score =
    (levels.indexOf(likelihood) + 1) * (levels.indexOf(impact) + 1);

  if (score >= 7) return "rgba(244, 67, 54, 0.20)";
  if (score >= 4) return "rgba(255, 152, 0, 0.18)";
  return "rgba(76, 175, 80, 0.14)";
};

const defaultRisks = [
  {
    name: "Market Adoption Risk",
    likelihood: "Medium",
    impact: "High",
    description: "Customer acquisition may be slower than expected",
  },
  {
    name: "Competitive Pressure",
    likelihood: "High",
    impact: "Medium",
    description: "Established players may respond aggressively",
  },
  {
    name: "Execution Risk",
    likelihood: "Medium",
    impact: "Medium",
    description: "Operational complexity may slow scaling",
  },
];

const safeRisks = (risks) =>
  Array.isArray(risks) && risks.length > 0 ? risks : defaultRisks;

const RiskHeatmap = ({ risks }) => {
  const data = safeRisks(risks);

  const getRisksForCell = (likelihood, impact) =>
    data.filter(
      (risk) => risk.likelihood === likelihood && risk.impact === impact
    );

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
        ⚠️ Risk Heatmap
      </div>
      <div style={{ opacity: 0.75, marginBottom: "16px", fontSize: "0.9rem" }}>
        Prioritized risk exposure analysis
      </div>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px repeat(3, minmax(180px, 1fr))",
            gap: "10px",
            alignItems: "stretch",
            minWidth: "700px",
          }}
        >
          <div></div>
          {levels.map((impact) => (
            <div
              key={impact}
              style={{
                fontWeight: 700,
                textAlign: "center",
                padding: "8px",
                opacity: 0.85,
              }}
            >
              Impact: {impact}
            </div>
          ))}

          {[...levels].reverse().map((likelihood) => (
            <React.Fragment key={likelihood}>
              <div
                style={{
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.85,
                }}
              >
                {likelihood}
              </div>

              {levels.map((impact) => {
                const cellRisks = getRisksForCell(likelihood, impact);

                return (
                  <div
                    key={`${likelihood}-${impact}`}
                    style={{
                      minHeight: "140px",
                      borderRadius: "14px",
                      padding: "10px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: getCellColor(likelihood, impact),
                    }}
                  >
                    {cellRisks.length === 0 ? (
                      <div style={{ opacity: 0.35, fontSize: "0.85rem" }}>—</div>
                    ) : (
                      cellRisks.map((risk, idx) => (
                        <div
                          key={idx}
                          style={{
                            marginBottom: "8px",
                            padding: "8px",
                            borderRadius: "10px",
                            background: "rgba(255,255,255,0.06)",
                            fontSize: "0.85rem",
                          }}
                          title={risk.description}
                        >
                          {risk.name}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskHeatmap;