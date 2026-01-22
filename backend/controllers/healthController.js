import HealthLog from "../models/HealthLog.js";

// Add new health log entry
export const addHealthLog = async (req, res) => {
  try {
    const { userEmail, memberId, type, value, notes } = req.body;

    // Validate required fields
    if (!userEmail || !type || value === undefined || value === null || value === "") {
      return res.status(400).json({ 
        error: "userEmail, type, and value are required" 
      });
    }

    // Create new health log document
    // Type validation is handled by Mongoose enum - no transformation needed
    const log = new HealthLog({
      userEmail,
      memberId: memberId || null,
      type, // Use type exactly as provided (no transformation)
      value,
      notes: notes || "",
    });

    // Save to database
    await log.save();

    // Return 201 with created document
    return res.status(201).json(log);
  } catch (error) {
    console.error("Error adding health log:", error);
    
    // Handle validation errors (e.g., invalid enum type)
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        error: "Invalid data provided",
        details: error.message 
      });
    }
    
    // Handle other errors
    return res.status(500).json({ 
      error: "Failed to add health log",
      message: error.message 
    });
  }
};

// Get health logs for a user
export const getHealthLogs = async (req, res) => {
  try {
    const { email } = req.params;

    // Validate email parameter
    if (!email) {
      return res.status(400).json({ 
        error: "Email parameter is required" 
      });
    }

    // Query health logs by userEmail (not email field)
    // Sort by createdAt DESC to get latest first
    const logs = await HealthLog.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Return array of logs
    return res.json(logs);
  } catch (error) {
    console.error("Error fetching health logs:", error);
    return res.status(500).json({ 
      error: "Failed to fetch health logs",
      message: error.message 
    });
  }
};


