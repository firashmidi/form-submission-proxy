import cors from "cors"
import fetch from "node-fetch"

// Enable detailed debugging
const DEBUG = true

// Use test mode to avoid hitting the actual Power Automate endpoint during testing
// Set this to false when you have a real Power Automate URL
const TEST_MODE = false

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

    // Extract the form data directly - no additional formatting
    const { name, email, phone, message } = req.body

    // This is the exact format Power Automate expects
    const powerAutomateData = { name, email, phone, message }

    console.log("Data for Power Automate:", powerAutomateData)

    if (TEST_MODE) {
      // Simulate a successful response in test mode
      console.log("TEST MODE: Simulating successful Power Automate response")

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return res.json({
        success: true,
        message: "Form submitted successfully (TEST MODE)",
        data: {
          id: "test-123",
          timestamp: new Date().toISOString(),
          formattedData: powerAutomateData,
        },
      })
    }

    // Replace with your actual Power Automate endpoint URL
    // Example: https://prod-123.westus.logic.azure.com:443/workflows/abc123def456/triggers/manual/paths/invoke
    const powerAutomateUrl =
      "https://prod-03.northeurope.logic.azure.com:443/workflows/9f5e7c302eaf46f796d199a196ae0607/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ErimU_C1pFNYydz2O4_Tmq3F1Hhml-kDJZzJcmbYixY"

    if (DEBUG) {
      console.log(`Sending request to Power Automate: ${powerAutomateUrl}`)
      console.log(`Request body: ${JSON.stringify(powerAutomateData)}`)
    }

    const response = await fetch(powerAutomateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(powerAutomateData),
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

