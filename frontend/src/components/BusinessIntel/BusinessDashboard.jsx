import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import SwotMatrix from "./SwotMatrix";
import RiskHeatmap from "./RiskHeatmap";
import ExportPdfButton from "./ExportPdfButton";

const cardStyle = {
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
  padding: "16px",
  minHeight: "100px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
};

const titleStyle = {
  fontSize: "0.9rem",
  opacity: 0.8,
  marginBottom: "8px",
};

const valueStyle = {
  fontSize: "1.6rem",
  fontWeight: 700,
};

const sectionTitleStyle = {
  fontSize: "1.2rem",
  fontWeight: 700,
  marginBottom: "12px",
};

const defaultMetrics = {
  marketPotential: 78,
  riskLevel: 45,
  competitionIntensity: 68,
  executionDifficulty: 55,
  recommendationScore: 81,
  growthOpportunity: 84,
};

const normalizeMetrics = (structured) => {
  const metrics = structured?.metrics || {};

  return {
    marketPotential:
      typeof metrics.marketPotential === "number"
        ? metrics.marketPotential
        : defaultMetrics.marketPotential,
    riskLevel:
      typeof metrics.riskLevel === "number"
        ? metrics.riskLevel
        : defaultMetrics.riskLevel,
    competitionIntensity:
      typeof metrics.competitionIntensity === "number"
        ? metrics.competitionIntensity
        : defaultMetrics.competitionIntensity,
    executionDifficulty:
      typeof metrics.executionDifficulty === "number"
        ? metrics.executionDifficulty
        : defaultMetrics.executionDifficulty,
    recommendationScore:
      typeof metrics.recommendationScore === "number"
        ? metrics.recommendationScore
        : defaultMetrics.recommendationScore,
    growthOpportunity:
      typeof metrics.growthOpportunity === "number"
        ? metrics.growthOpportunity
        : defaultMetrics.growthOpportunity,
  };
};

const KpiCard = ({ title, value }) => {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>{title}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
};

const BusinessDashboard = ({ structured, messageId }) => {
  const metrics = normalizeMetrics(structured);

  const chartData = [
    { name: "Market", value: metrics.marketPotential },
    { name: "Risk", value: metrics.riskLevel },
    { name: "Competition", value: metrics.competitionIntensity },
    { name: "Execution", value: metrics.executionDifficulty },
    { name: "Recommendation", value: metrics.recommendationScore },
    { name: "Growth", value: metrics.growthOpportunity },
  ];

  const exportTargetId = `business-dashboard-export-${messageId}`;

  return (
    <div
      id={exportTargetId}
      style={{
        marginTop: "18px",
        padding: "18px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={sectionTitleStyle}>📊 Business Intelligence Dashboard</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        <KpiCard title="Market Potential" value={`${metrics.marketPotential}/100`} />
        <KpiCard title="Risk Level" value={`${metrics.riskLevel}/100`} />
        <KpiCard
          title="Competition Intensity"
          value={`${metrics.competitionIntensity}/100`}
        />
        <KpiCard
          title="Execution Difficulty"
          value={`${metrics.executionDifficulty}/100`}
        />
        <KpiCard
          title="Recommendation Score"
          value={`${metrics.recommendationScore}/100`}
        />
        <KpiCard
          title="Growth Opportunity"
          value={`${metrics.growthOpportunity}/100`}
        />
      </div>

      <div
        style={{
          ...cardStyle,
          height: "360px",
          padding: "20px",
          marginBottom: "18px",
        }}
      >
        <div style={{ ...sectionTitleStyle, marginBottom: "18px" }}>
          Business Viability Metrics
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
            <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.7)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e1e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SwotMatrix swot={structured?.swot} />
      <RiskHeatmap risks={structured?.risks} />

      <ExportPdfButton
        targetId={exportTargetId}
        fileName="business-analysis-report"
      />
    </div>
  );
};

export default BusinessDashboard;