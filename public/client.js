document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form")
  const submitBtn = document.getElementById("submit-btn")
  const statusMessage = document.getElementById("status-message")

  // Test server connection on page load
  fetch("/api/test")
    .then((response) => response.json())
    .then((data) => {
      console.log("Server connection test:", data)
      showMessage("Server connected successfully!", "success")
      setTimeout(() => {
        statusMessage.classList.add("hidden")
      }, 3000)
    })
    .catch((error) => {
      console.error("Server connection test failed:", error)
      showMessage("Server connection error. Please check if the server is running.", "error")
    })

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Basic form validation
    const name = document.getElementById("name").value.trim()
    const email = document.getElementById("email").value.trim()
    const phone = document.getElementById("phone").value.trim()
    const message = document.getElementById("message").value.trim()

    if (!name || !email || !phone) {
      showMessage("Please fill in all required fields.", "error")
      return
    }

    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address.", "error")
      return
    }

    if (!isValidPhone(phone)) {
      showMessage("Please enter a valid phone number.", "error")
      return
    }

    // Prepare form data
    const formData = {
      name,
      email,
      phone,
      message,
    }

    // Show loading state
    setLoading(true)

    try {
      console.log("Submitting form data:", formData)

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)

      let data
      try {
        data = await response.json()
        console.log("Response data:", data)
      } catch (parseError) {
        console.error("Error parsing response:", parseError)
        const text = await response.text()
        console.log("Response text:", text)
        throw new Error("Invalid response format")
      }

      if (response.ok && data.success) {
        showMessage("Form submitted successfully! We will contact you soon.", "success")
        form.reset()
      } else {
        const errorDetails = data.details ? `: ${data.details}` : ""
        showMessage(`Submission error: ${data.message || "Unknown error"}${errorDetails}`, "error")
        console.error("Form submission error:", data)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      showMessage(`Network error: ${error.message}. Please check if the server is running.`, "error")
    } finally {
      setLoading(false)
    }
  })

  function showMessage(message, type) {
    statusMessage.textContent = message
    statusMessage.className = ""
    statusMessage.classList.add(type)
    statusMessage.classList.remove("hidden")

    // Auto-hide success messages after 5 seconds
    if (type === "success") {
      setTimeout(() => {
        statusMessage.classList.add("hidden")
      }, 5000)
    }
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true
      submitBtn.innerHTML = '<span class="spinner"></span> Submitting...'
    } else {
      submitBtn.disabled = false
      submitBtn.textContent = "Submit"
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function isValidPhone(phone) {
    // Basic phone validation - allows different formats
    const phoneRegex = /^[\d+\-$$$$ ]{7,20}$/
    return phoneRegex.test(phone)
  }
})

