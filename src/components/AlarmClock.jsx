import React, { useState, useEffect, useRef } from 'react';
import '../styles/AlarmClock.css';

function AlarmClock() {
  const [time, setTime] = useState(new Date());
  const [alarm, setAlarm] = useState(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Reference for the audio element
  const audioRef = useRef(null);

  // References for the inputs
  const hoursInputRef = useRef(null);
  const minutesInputRef = useRef(null);
  
  // Initialize audio - reliable GitHub hosted URL
  useEffect(() => {
    if (audioRef.current) {
      // Set a reliable GitHub Pages hosted alarm sound
      audioRef.current.src = "https://cdn.freesound.org/previews/219/219244_4082826-lq.mp3";
      
      // Add event listeners for audio loading
      const handleCanPlay = () => {
        console.log("Audio loaded successfully");
        setAudioLoaded(true);
      };
      
      const handleError = () => {
        console.error("Error loading audio, trying backup URL");
        audioRef.current.src = "https://soundbible.com/mp3/Alarm-SoundBible.com-248103397.mp3";
      };
      
      audioRef.current.addEventListener('canplaythrough', handleCanPlay);
      audioRef.current.addEventListener('error', handleError);
      
      // Preload the audio
      audioRef.current.load();
      
      // Try to unlock audio on Safari/iOS by playing it silently
      const unlockAudio = () => {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1;
        }).catch(err => {
          console.log("Audio couldn't be unlocked automatically:", err);
        });
      };
      
      unlockAudio();
      
      // Clean up
      return () => {
        audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
        audioRef.current.removeEventListener('error', handleError);
      };
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setTime(now);
     
      // Check if alarm should go off
      if (isAlarmSet && alarm) {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const [alarmHours, alarmMinutes] = alarm.split(':').map(num => parseInt(num));
       
        if (currentHours === alarmHours &&
            currentMinutes === alarmMinutes &&
            now.getSeconds() === 0) {
          // Play the alarm
          setIsAlarmRinging(true);
          
          if (audioRef.current) {
            // Make sure audio is at the beginning
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 1;
            
            // Enhanced play method with retry
            const playWithRetry = () => {
              audioRef.current.play().catch(err => {
                console.error("Failed to play alarm:", err);
                
                // If it's an autoplay policy issue, show an alert that requires user interaction
                const userInteraction = window.confirm("Click OK to enable alarm sound");
                if (userInteraction) {
                  // Try again after user interaction
                  audioRef.current.play().catch(e => {
                    console.error("Still failed after user interaction:", e);
                  });
                }
              });
            };
            
            playWithRetry();
          }
        }
      }
    }, 1000);
   
    return () => clearInterval(intervalId);
  }, [isAlarmSet, alarm]);

  const formatNumber = (number) => {
    return number < 10 ? `0${number}` : number;
  };

  // Variables for clock display
  const hours = formatNumber(time.getHours());
  const displayHours = formatNumber(time.getHours() % 12 || 12);
  const minutes = formatNumber(time.getMinutes());
  const seconds = formatNumber(time.getSeconds());
  const period = time.getHours() >= 12 ? 'PM' : 'AM';

  // Calculate hand rotations
  const secondsDegrees = (time.getSeconds() / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  // Function to stop the alarm
  const handleStopAlarm = () => {
    console.log("Stopping alarm");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsAlarmRinging(false);
  };

  const setAlarmTime = () => {
    if (isAlarmSet) {
      // Disable the alarm
      setIsAlarmSet(false);
      setAlarm(null);
     
      // Stop the alarm if it's ringing
      if (isAlarmRinging) {
        handleStopAlarm();
      }
     
      // Clear the inputs
      if (hoursInputRef.current) hoursInputRef.current.value = '';
      if (minutesInputRef.current) minutesInputRef.current.value = '';
    } else {
      // Get current input values
      const hours = hoursInputRef.current ? hoursInputRef.current.value.trim() : '';
      const minutes = minutesInputRef.current ? minutesInputRef.current.value.trim() : '';
     
      // Validate
      if (!hours || !minutes || isNaN(hours) || isNaN(minutes)) {
        alert('Please set a valid alarm time');
        return;
      }
     
      const hoursNum = parseInt(hours);
      const minutesNum = parseInt(minutes);
     
      if (hoursNum < 1 || hoursNum > 12 || minutesNum < 0 || minutesNum > 59) {
        alert('Please set a valid alarm time (hours: 1-12, minutes: 0-59)');
        return;
      }
     
      // Format and activate
      const formattedHours = formatNumber(hoursNum);
      const formattedMinutes = formatNumber(minutesNum);
      
      // Convert 12-hour format to 24-hour format if PM
      let finalHours = hoursNum;
      if (period === 'PM' && hoursNum < 12) {
        finalHours = hoursNum + 12;
      } else if (period === 'AM' && hoursNum === 12) {
        finalHours = 0;
      }
      
      setAlarm(`${finalHours}:${formattedMinutes}`);
      setIsAlarmSet(true);
      
      // Test audio if not loaded
      if (audioRef.current) {
        audioRef.current.volume = 0.1;
        audioRef.current.play().then(() => {
          setTimeout(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 1;
          }, 300);
        }).catch(err => {
          console.log("Audio test failed, may need user interaction:", err);
        });
      }
    }
  };

  // Function to handle input focus
  const handleFocus = (e) => {
    e.target.select();
  };

  // Handler for key presses
  const handleKeyDown = (e) => {
    // If it's a numeric digit (0-9)
    if (/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
      // If text is selected, let default behavior occur
      if (e.target.selectionStart !== e.target.selectionEnd) {
        return;
      }
     
      // If already has a digit and cursor is at the end,
      // check if we can add another digit
      if (e.target.value.length === 1 && e.target.selectionStart === 1) {
        const currentDigit = parseInt(e.target.value);
        const newDigit = parseInt(e.key);
        const potentialValue = currentDigit * 10 + newDigit;
       
        // Check if resulting value is valid for hours or minutes
        const isHoursInput = e.target === hoursInputRef.current;
        const maxValue = isHoursInput ? 12 : 59; // 12 for hours, 59 for minutes
        const minValue = isHoursInput ? 1 : 0;  // 1 for hours, 0 for minutes
       
        if (potentialValue <= maxValue && potentialValue >= minValue) {
          // Allow adding second digit
          return;
        } else {
          // Value would be invalid, prevent typing
          e.preventDefault();
          // Clean the input if user tries to add a invalid value for hours
          if (isHoursInput && potentialValue > maxValue) {
            e.target.value = '';
          }
        }
      }
     
      // If already has two digits, replace everything with the new digit
      if (e.target.value.length === 2) {
        e.preventDefault();
        e.target.value = e.key;
      }
    }
  };

  // Validation functions for inputs
  const validateHours = (e) => {
    const value = e.target.value.trim();
    if (value === '') return;
   
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 12) {
      e.target.value = '';
    } else if (num < 10 && value.length === 1) {
      e.target.value = `0${num}`;
    }
  };

  const validateMinutes = (e) => {
    const value = e.target.value.trim();
    if (value === '') return;
   
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 59) {
      e.target.value = '';
    } else if (num < 10 && value.length === 1) {
      e.target.value = `0${num}`;
    }
  };

  return (
    <div className="alarm-container">
      <div className="clock-container">
        {/* Clock SVG */}
        <svg className="clock-face" viewBox="0 0 100 100">
          {/* Outer circle */}
          <circle className="clock-circle" cx="50" cy="50" r="45" />
         
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const x1 = 50 + 38 * Math.sin(angle);
            const y1 = 50 - 38 * Math.cos(angle);
            const x2 = 50 + 42 * Math.sin(angle);
            const y2 = 50 - 42 * Math.cos(angle);
           
            return (
              <line
                key={i}
                className="hour-marker"
                x1={x1} y1={y1} x2={x2} y2={y2}
              />
            );
          })}
         
          {/* Hour numbers */}
          {[...Array(12)].map((_, i) => {
            const hour = i === 0 ? 12 : i;
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 50 + 32 * Math.cos(angle);
            const y = 50 + 32 * Math.sin(angle);
           
            return (
              <text
                key={i}
                className="hour-text"
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {hour}
              </text>
            );
          })}
         
          {/* Clock hands */}
          <line
            className="hour-hand"
            x1="50"
            y1="50"
            x2="50"
            y2="30"
            style={{ transform: `rotate(${hoursDegrees}deg)`, transformOrigin: '50px 50px' }}
          />
         
          <line
            className="minute-hand"
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            style={{ transform: `rotate(${minutesDegrees}deg)`, transformOrigin: '50px 50px' }}
          />
         
          <line
            className="second-hand"
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            style={{ transform: `rotate(${secondsDegrees}deg)`, transformOrigin: '50px 50px' }}
          />
         
          {/* Center circle */}
          <circle className="mid-circle" cx="50" cy="50" r="4" />
        </svg>
       
        <div className="digital-display">
          <span>{displayHours}</span>
          <span className="colon">:</span>
          <span>{minutes}</span>
          <span className="colon">:</span>
          <span>{seconds}</span>
          <span className="period">{period}</span>
        </div>
       
        {/* Move Stop Alarm button inside the clock container for better visibility */}
        {isAlarmRinging && (
          <button
            onClick={handleStopAlarm}
            className="stop-alarm-button"
          >
            Stop Alarm
          </button>
        )}

        <div className="alarm-controls">
          <div className="alarm-inputs">
            <input
              type="text"
              placeholder="HH"
              className="time-input"
              ref={hoursInputRef}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              onBlur={validateHours}
              maxLength={2}
            />
            <span className="colon">:</span>
            <input
              type="text"
              placeholder="MM"
              className="time-input"
              ref={minutesInputRef}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              onBlur={validateMinutes}
              maxLength={2}
            />
          </div>
          <button
            onClick={setAlarmTime}
            className={`alarm-button ${isAlarmSet ? 'active' : ''}`}
          >
            {isAlarmSet ? 'Disable Alarm' : 'Set Alarm'}
          </button>
        </div>
      </div>
     
      {/* Audio element with reliable URL */}
      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
        preload="auto"
        loop
      />
    </div>
  );
}

export default AlarmClock;
