import cors from "cors"
import fetch from "node-fetch"

// Enable detailed debugging
const DEBUG = true

// Use test mode to avoid hitting the actual Power Automate endpoint during testing
const TEST_MODE = true

// CORS middleware handler
const corsHandler = cors({
  origin: "*", // Allow all origins for testing
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
})

export default async function handler(req, res) {
  // Handle CORS
  await new Promise((resolve, reject) => {
    corsHandler(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    console.log("Received form data:", req.body)

    if (TEST_MODE) {
      // Simulate a successful response in test mode
      console.log("TEST MODE: Simulating successful Power Automate response")

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return res.json({
        success: true,
        message: "Form submitted successfully (TEST MODE)",
        data: { id: "test-123", timestamp: new Date().toISOString() },
      })
    }

    // Replace with your actual Power Automate endpoint URL
    const powerAutomateUrl =
      "https://prod-XX.westus.logic.azure.com:443/workflows/YOUR_WORKFLOW_ID/triggers/manual/paths/invoke"

    if (DEBUG) {
      console.log(`Sending request to Power Automate: ${powerAutomateUrl}`)
    }

    const response = await fetch(powerAutomateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Power Automate error:", errorText)
      console.error("Status:", response.status, response.statusText)

      return res.status(response.status).json({
        success: false,
        message: "Error submitting to Power Automate",
        details: errorText,
        status: response.status,
        statusText: response.statusText,
      })
    }

    const data = await response.json()
    console.log("Power Automate response:", data)

    res.json({
      success: true,
      message: "Form submitted successfully",
      data,
    })
  } catch (error) {
    console.error("Server error:", error)
    res.status(500).json({
      success: false,
      message: "Server error processing your request",
      error: error.message,
      stack: DEBUG ? error.stack : undefined,
    })
  }
}

