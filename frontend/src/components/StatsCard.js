import React from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

/*
  Small stats card showing a circular progress + label.
  Accepts title and percent (0-100).
*/
const StatsCard = ({ title, percent }) => {
  const data = [{ name: title, value: percent }];
  return (
    <div className="ac-stats-card">
      <div style={{ width: 90, height: 90 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <RadialBar minAngle={15} background clockWise dataKey="value" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="ac-stats-text">
        <div className="ac-stats-title">{title}</div>
        <div className="ac-stats-value">{percent}%</div>
      </div>
    </div>
  );
};

export default StatsCard;
