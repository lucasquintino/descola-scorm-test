import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import './index.css';

const HTMLContainer = ({ html, onHandleOpen }) => {
  useEffect(() => {
    const onLoadPage = () => {
      onHandleOpen();
    };
    onLoadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="html-container"
      dangerouslySetInnerHTML={{
        __html: html
      }}
    />
  );
};

HTMLContainer.propTypes = {
  html: PropTypes.string.isRequired,
  onHandleOpen: PropTypes.func.isRequired
};

export default HTMLContainer;
