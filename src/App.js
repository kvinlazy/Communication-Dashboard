import React, { useState, useEffect } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import M from "materialize-css"; // For Materialize components
import "./App.css";

const App = () => {
  const [data, setData] = useState({ dates: [], messageVolume: [] });
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [newReferral, setNewReferral] = useState({
    name: "",
    dob: "",
    hospitalNumber: "",
    reason: "",
  });

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/metrics");
        const dates = response.data.map((item) => item.Date);
        const messageVolume = response.data.map((item) => item["Message Volume"]);
        setData({ dates, messageVolume });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
    fetchMetrics();
  }, []);

  // Handle chatbot messages
  const handleSendMessage = async () => {
    try {
      setMessages([...messages, { role: "user", content: userInput }]);
      const response = await axios.post("http://127.0.0.1:5000/ask", { message: userInput });
      const aiResponse = response.data.reply || "Sorry, something went wrong.";
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: userInput },
        { role: "assistant", content: aiResponse },
      ]);
      setUserInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle referrals
  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setReferrals((prevReferrals) => [
      ...prevReferrals,
      { ...newReferral, status: "Incomplete", dateSubmitted: new Date() },
    ]);
    setNewReferral({ name: "", dob: "", hospitalNumber: "", reason: "" });
  };

  // Initialize Materialize components
  useEffect(() => {
    M.AutoInit();
  }, []);

  return (
    <div className="container">
      <h1 className="center-align">Communication Dashboard</h1>

      {/* Tabs for navigation */}
      <div className="row">
        <div className="col s12">
          <ul className="tabs">
            <li className="tab col s3"><a href="#ai-doctor">AI Doctor</a></li>
            <li className="tab col s3"><a href="#metrics">Metrics</a></li>
            <li className="tab col s3"><a href="#referrals">Referrals</a></li>
          </ul>
        </div>

        {/* AI Doctor Tab */}
        <div id="ai-doctor" className="col s12">
          <h2>AI Doctor Chatbot</h2>
          <div className="input-field">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              id="question"
            />
            <label htmlFor="question">Ask your question</label>
          </div>
          <button className="btn waves-effect waves-light" onClick={handleSendMessage}>
            Send
          </button>
          <div className="chat">
            {messages.map((msg, index) => (
              <p key={index}>
                <strong>{msg.role === "user" ? "You" : "AI Doctor"}:</strong> {msg.content}
              </p>
            ))}
          </div>
        </div>

        {/* Metrics Tab */}
        <div id="metrics" className="col s12">
          <h2>Message Volume Over Time</h2>
          <Plot
            data={[
              {
                x: data.dates,
                y: data.messageVolume,
                type: "scatter",
                mode: "lines+markers",
                marker: { color: "blue" },
              },
            ]}
            layout={{
              title: "Message Volume Over Time",
              xaxis: { title: "Date" },
              yaxis: { title: "Message Volume" },
            }}
          />
        </div>

        {/* Referrals Tab */}
        <div id="referrals" className="col s12">
          <h2>Referrals</h2>
          <form onSubmit={handleReferralSubmit}>
            <div className="input-field">
              <input
                type="text"
                value={newReferral.name}
                onChange={(e) => setNewReferral({ ...newReferral, name: e.target.value })}
                id="name"
                required
              />
              <label htmlFor="name">Patient's Name</label>
            </div>
            <div className="input-field">
              <input
                type="date"
                value={newReferral.dob}
                onChange={(e) => setNewReferral({ ...newReferral, dob: e.target.value })}
                id="dob"
                required
              />
              <label htmlFor="dob">Date of Birth</label>
            </div>
            <div className="input-field">
              <input
                type="text"
                value={newReferral.hospitalNumber}
                onChange={(e) => setNewReferral({ ...newReferral, hospitalNumber: e.target.value })}
                id="hospitalNumber"
                required
              />
              <label htmlFor="hospitalNumber">Hospital Number</label>
            </div>
            <div className="input-field">
              <textarea
                className="materialize-textarea"
                value={newReferral.reason}
                onChange={(e) => setNewReferral({ ...newReferral, reason: e.target.value })}
                id="reason"
                required
              ></textarea>
              <label htmlFor="reason">Reason for Referral</label>
            </div>
            <button className="btn waves-effect waves-light" type="submit">
              Submit Referral
            </button>
          </form>
          <h3>Submitted Referrals</h3>
          <ul className="collection">
            {referrals.map((referral, index) => (
              <li key={index} className="collection-item">
                <strong>{referral.name}</strong> - {referral.status} - Submitted on {new Date(referral.dateSubmitted).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
