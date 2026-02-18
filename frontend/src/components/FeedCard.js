import React from "react";

/*
  Small feed card used in right-rail — short message + timestamp
*/
const FeedCard = ({ title, body, time }) => (
  <div className="ac-feed-card">
    <strong>{title}</strong>
    <p className="muted small">{body}</p>
    <div className="muted tiny">{time}</div>
  </div>
);

export default FeedCard;
