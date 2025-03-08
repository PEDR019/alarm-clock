import { useState, useEffect } from 'react';
import '../styles/AlarmClock.css';

function AlarmClock() {
  const [time, setTime] = useState(new Date());
  const [alarm, setAlarm] = useState(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [alarmHours, setAlarmHours] = useState('00');
  const [alarmMinutes, setAlarmMinutes] = useState('00');
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setTime(now);
      
      // Verificar se o alarme deve disparar
      if (isAlarmSet && alarm) {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        
        if (currentHours === parseInt(alarmHours) && 
            currentMinutes === parseInt(alarmMinutes) && 
            now.getSeconds() === 0) {
          alert('ALARME!');
          // Aqui você poderia tocar um som
        }
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isAlarmSet, alarm, alarmHours, alarmMinutes]);
  
  const formatNumber = (number) => {
    return number < 10 ? `0${number}` : number;
  };
  
  const hours = formatNumber(time.getHours());
  const minutes = formatNumber(time.getMinutes());
  const seconds = formatNumber(time.getSeconds());
  
  const setAlarmTime = () => {
    setAlarm(`${alarmHours}:${alarmMinutes}`);
    setIsAlarmSet(true);
  };
  
  return (
    <div className="alarm-clock-container">
      <div className="alarm-clock">
        <div className="clock-display">
          <div className="time">
            <span className="hours">{hours}</span>
            <span className="separator">:</span>
            <span className="minutes">{minutes}</span>
            <span className="separator">:</span>
            <span className="seconds">{seconds}</span>
          </div>
        </div>
        
        <div className="alarm-controls">
          <input 
            type="number" 
            min="0" 
            max="23" 
            value={alarmHours}
            onChange={(e) => setAlarmHours(formatNumber(e.target.value))}
            placeholder="HH"
          />
          <span>:</span>
          <input 
            type="number" 
            min="0" 
            max="59" 
            value={alarmMinutes}
            onChange={(e) => setAlarmMinutes(formatNumber(e.target.value))}
            placeholder="MM"
          />
          <button onClick={setAlarmTime}>
            {isAlarmSet ? 'Desativar Alarme' : 'Ativar Alarme'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlarmClock;