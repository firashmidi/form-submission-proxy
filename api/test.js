export default function handler(req, res) {
    res.json({
      message: "Server is running correctly",
      time: new Date().toISOString(),
      env: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    })
  }
  
  