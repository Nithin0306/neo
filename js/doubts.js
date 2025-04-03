document.addEventListener("DOMContentLoaded", () => {
  const submitButton = document.getElementById("submit-doubt");
  if (!submitButton) {
    console.error("Submit button not found!");
    return;
  }

  submitButton.addEventListener("click", async () => {
    const input = document.getElementById("doubt-input");
    const question = input.value.trim();
    const responseContainer = document.getElementById("response-container");

    if (!question) {
      alert("Please enter a question!");
      return;
    }

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "response-item";
    loadingDiv.textContent = "Fetching answer...";
    // Add the loading message at the top
    responseContainer.insertBefore(loadingDiv, responseContainer.firstChild);

    try {
      console.log("Sending question:", question);
      const response = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      responseContainer.removeChild(loadingDiv);

      const responseDiv = document.createElement("div");
      responseDiv.className = "response-item";
      if (data.error) {
        responseDiv.innerHTML = `<strong>Your Question:</strong> ${question}<br><strong>Error:</strong> ${data.error}`;
      } else if (data.answer) {
        responseDiv.innerHTML = `<strong>Your Question:</strong> ${question}<br><strong>Answer:</strong> ${data.answer}`;
      } else {
        responseDiv.innerHTML = `<strong>Your Question:</strong> ${question}<br><strong>Error:</strong> Unexpected response format`;
      }
      // Add the response at the top
      responseContainer.insertBefore(responseDiv, responseContainer.firstChild);

      input.value = "";
    } catch (error) {
      console.error("Error:", error);
      responseContainer.removeChild(loadingDiv);
      const errorDiv = document.createElement("div");
      errorDiv.className = "response-item";
      errorDiv.textContent = "Error fetching answer. Please try again.";
      // Add the error message at the top
      responseContainer.insertBefore(errorDiv, responseContainer.firstChild);
    }
  });
});
