import React, { useState } from 'react';
import './App.css';

function App() {
  const [cwnd, setCwnd] = useState(1); // Congestion window
  const [ssthresh, setSsthresh] = useState(64); // Slow start threshold
  const [sent, setSent] = useState([0]); // Sent packets
  const [lost, setLost] = useState([]); // Lost packets
  const [lost_pkt, setLost_pkt] = useState(0); // Packet to mark as lost
  const [ack, setAck] = useState(0); // Acknowledgment
  const [algorithm, setAlgorithm] = useState('Slow Start'); // Current algorithm
  const [duplicateAckCount, setDuplicateAckCount] = useState(0); // Duplicate ACK count

  const handleChangeAlgorithm = (event) => {
    setAlgorithm(event.target.value);
    setDuplicateAckCount(0); // Reset duplicate ACK count when algorithm changes
  };

  const handleChangeThresh = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setSsthresh(value);
    }
  };

  const handleChangeLostPkt = (event) => {
    const value = parseInt(event.target.value);
    if (sent.includes(value)) {
      setLost_pkt(value);
    }
  };

  const handleLost = () => {
    if (!lost.includes(lost_pkt) && sent.includes(lost_pkt)) {
      setLost((prevLost) => [...prevLost, lost_pkt]);
      alert(`Packet ${lost_pkt} marked as lost!`);
    }
  };

  const handleClick = () => {
    if (algorithm === 'Fast Retransmit' && lost.includes(lost_pkt)) {
      setDuplicateAckCount((prev) => prev + 1); // Increase duplicate ACK count
  
      if (duplicateAckCount === 2) { // Check if it’s the third duplicate ACK
        const newSsthresh = Math.max(1, Math.floor(cwnd / 2));
        setSsthresh(newSsthresh); // Update ssthresh
        setCwnd(newSsthresh + 3); // Inflate cwnd for Fast Recovery
        setAlgorithm('Fast Recovery');
  
        // Retransmit the lost packet
        alert(`Retransmitting lost packet: ${lost_pkt}`);
        setLost_pkt(lost_pkt); // Reset lost_pkt to ensure it's retransmitted
        setDuplicateAckCount(0); // Reset duplicate ACK count after retransmission
      }
    } else {
      // Standard packet transfer logic
      setAck(sent[sent.length - 1] + 1);
      setSent((prevSent) => [...prevSent, prevSent[prevSent.length - 1] + 1]);
  
      if (algorithm === 'Slow Start') {
        if (cwnd < ssthresh) {
          setCwnd((prev) => prev * 2); // Use functional update
        } else {
          setAlgorithm('Congestion Avoidance');
        }
      } else if (algorithm === 'Congestion Avoidance') {
        setCwnd((prev) => prev + 1); // Use functional update
      }
  
      // Check for duplicate ACKs if the current ACK matches the lost packet
      if (ack === lost_pkt + 1) {
        setDuplicateAckCount((prev) => prev + 1);
      }
    }
  };
  
  const handleNext = () => {
    if (algorithm === 'Slow Start') {
      if (cwnd < ssthresh) {
        setCwnd((prev) => prev * 2); // Use functional update
      } else {
        setAlgorithm('Congestion Avoidance');
      }
    } else if (algorithm === 'Congestion Avoidance') {
      setCwnd((prev) => prev + 1); // Use functional update
    } else if (algorithm === 'Fast Recovery') {
      setCwnd((prev) => prev + 1); // Increment in Fast Recovery phase
      if (ack === lost_pkt + 1) {
        setAlgorithm('Congestion Avoidance');
        setCwnd(ssthresh); // Reset cwnd to ssthresh upon exiting Fast Recovery
      }
    }
  };
  

  return (
    <div className="App">
      <header className="App-header">Simulate Congestion Control Algorithms</header>
      <div className="App-body">
        <div className="algorithm-selector">
          <label>Select Algorithm:</label>
          <select value={algorithm} onChange={handleChangeAlgorithm}>
            <option value="Slow Start">Slow Start</option>
            <option value="Congestion Avoidance">Congestion Avoidance</option>
            <option value="Fast Retransmit">Fast Retransmit</option>
            <option value="Fast Recovery">Fast Recovery</option>
          </select>
        </div>

        <div className="initialvalues">
          <div className="pkthead">
            <h2>Congestion Window</h2>
            <p>{cwnd}</p> {/* Display current cwnd */}
          </div>

          <div className="pkthead">
            <h2>Slow Start Threshold</h2>
            <p>{ssthresh}</p>
          </div>
          <div className="pkthead">
            <h3>Change Initial Slow Start Threshold</h3>
            <input type="number" onChange={handleChangeThresh} value={ssthresh} />
          </div>
        </div>

        <div className="send">
          <div>
            <h4>The packets to be transferred in this window have the following sequence numbers</h4>
            <h5># {sent.join(', ')}</h5>
          </div>
          <div>
            <h4>The packets to be simulated as lost in this window have the following sequence numbers</h4>
            <h5># {lost.join(', ')}</h5>
            <input type="number" onChange={handleChangeLostPkt} value={lost_pkt} />
            <button onClick={handleLost}>Lost</button>
          </div>
        </div>

        {algorithm === 'Fast Retransmit' && (
          <div>
            <h4>Duplicate ACK Count</h4>
            <input
              type="number"
              value={duplicateAckCount}
              onChange={(e) => setDuplicateAckCount(Number(e.target.value))}
            />
          </div>
        )}

        <button onClick={handleClick} className="simulate">Simulate the packet transfer for current window</button>

        <div className="ack">
          <h2>Received Acknowledgement after transfer: ACK {ack}</h2>
        </div>

        <button onClick={handleNext} className="simulate">Shift the window for next simulation round</button>
      </div>
    </div>
  );
}

export default App;
