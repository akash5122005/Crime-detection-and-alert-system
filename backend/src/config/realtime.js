const { pool } = require("./database");

async function setupRealtimeListeners(io) {
  try {
    const client = await pool.connect();

    // Listen for new database notifications
    await client.query("LISTEN new_incident");
    await client.query("LISTEN new_alert");
    await client.query("LISTEN incident_updated");
    await client.query("LISTEN zone_risk_changed");

    client.on("notification", (msg) => {
      try {
        const data = JSON.parse(msg.payload);

        if (msg.channel === "new_incident") {
          io.emit("incident:new", data);
          io.emit("dashboard:refresh");
        }
        if (msg.channel === "new_alert") {
          io.emit("alert:new", data);
          io.emit("notification:push", {
            type: "anomaly",
            title: `Anomaly detected in Zone ${data.zone_id}`,
            message: `Score: ${data.score} — ${data.crime_type || 'Unknown'}`,
            severity: data.severity || 'medium',
            timestamp: new Date()
          });
        }
        if (msg.channel === "incident_updated") {
          io.emit("incident:updated", data);
        }
        if (msg.channel === "zone_risk_changed") {
          io.emit("zone:risk_updated", data);
        }
      } catch (err) {
        console.error("Failed to parse PostgreSQL notification payload:", err);
      }
    });

    console.log("Real-time PostgreSQL listeners active");
  } catch (error) {
    console.error("Failed to establish real-time PostgreSQL listeners:", error.message || error);
  }
}

module.exports = { setupRealtimeListeners };
