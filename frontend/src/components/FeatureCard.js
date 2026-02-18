import React from "react";

/*
  Reusable feature card — includes metric line and CTA.
  Accepts: title, subtitle, metric (string), ctaText, to (link or onClick).
*/
const FeatureCard = ({ title, subtitle, metric, ctaText, onClick }) => {
  return (
    <div className="ac-feature-card">
      <div className="ac-feature-top">
        <h4>{title}</h4>
        <p className="muted">{subtitle}</p>
      </div>

      <div className="ac-feature-mid">
        {metric ? <div className="ac-metric">{metric}</div> : null}
      </div>

      <div className="ac-feature-cta">
        <button className="ac-cta" onClick={onClick}>{ctaText || "Explore"}</button>
      </div>
    </div>
  );
};

export default FeatureCard;
