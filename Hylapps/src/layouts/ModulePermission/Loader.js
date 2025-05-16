import React from "react";
import PropTypes from "prop-types";
import "./Loader.css";

/**
 * Loader Component
 *
 * A highly reusable and memoized loading indicator that displays a customizable
 * number of animated loader elements. This component is intended to be used
 * during asynchronous data fetches or any operation that requires a visual
 * loading cue.
 *
 * @param {Object} props - Component props.
 * @param {number} props.count - Number of loader elements to display.
 *
 * @returns {JSX.Element} A container with animated loader elements.
 */
const Loader = React.memo(({ count }) => {
  // Create an array of loader divs based on the count prop.
  const loaders = Array.from({ length: count }, (_, index) => (
    <div key={index} className="loader" />
  ));

  return <div className="container">{loaders}</div>;
});

Loader.propTypes = {
  count: PropTypes.number,
};

Loader.defaultProps = {
  count: 3,
};

export default Loader;
