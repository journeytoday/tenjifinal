import React, { useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const Tour = () => {
  const [runTour, setRunTour] = useState(false);
  const [steps] = useState([
    {
      target: '.start-tour-btn',
      content: 'We are glad you are here!, we are building a App-Tour currently and will be available soon!',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '.search-bar',
      content: 'Use this search bar to find specific speeches',
      placement: 'bottom',
    },
    {
      target: '.protocol-cards',
      content: 'This is a protocol card containing meeting information',
      placement: 'right',
    },
    {
      target: '.in-text-btn',
      content: 'Click here to open the protocol details!',
      placement: 'bottom',
      spotlightClicks: true, // Allows clicking the button
    },
    {
      target: '.agenda-tab',
      content: 'Click here to view agenda items',
      placement: 'right',
      spotlightClicks: true,
    },
    {
      target: '.speech-tab',
      content: 'Switch to this tab to view speeches',
      placement: 'right',
      spotlightClicks: true,
    }
  ]);

  const handleJoyrideCallback = (data) => {
    const { status, action, index } = data;

    // Handle tour completion
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }

    // Handle specific step interactions
    if (action === 'update' && index === 3) {
      // Wait for modal to open after clicking in-text button
      setTimeout(() => {
        // Continue to next step
      }, 500);
    }
  };

  return (
    <>
      <button 
        className="start-tour-btn"
        onClick={() => setRunTour(true)}
      >
        Start Tour
      </button>

      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#007bff',
            zIndex: 10000, // Ensure tour appears above modal
          },
          tooltip: {
            fontSize: '14px',
          },
          buttonNext: {
            backgroundColor: '#007bff',
          },
          buttonBack: {
            marginRight: 10,
          },
        }}
      />
    </>
  );
};

export default Tour;