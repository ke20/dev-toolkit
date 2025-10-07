    const methodSelect = document.getElementById("method");
    const bodyInput = document.getElementById("bodyInput");
    const sendBtn = document.getElementById("sendRequest");
    const responseContainer = document.getElementById("responseContainer");
    const statusDiv = responseContainer.querySelector(".status");
    const headersDiv = responseContainer.querySelector(".headers");
    const jsonDiv = responseContainer.querySelector(".json");

    methodSelect.addEventListener("change", () => {
      bodyInput.style.display = methodSelect.value === "POST" ? "block" : "none";
    });

    sendBtn.addEventListener("click", async () => {
      const url = document.getElementById("url").value.trim();
      const method = methodSelect.value;
      const body = document.getElementById("body").value;

      if (!url) {
        alert("Please enter a valid API URL.");
        return;
      }

      responseContainer.style.display = "block";
      statusDiv.textContent = "Loading...";
      headersDiv.textContent = "";
      jsonDiv.textContent = "";

      try {
        const options = { method };
        if (method === "POST" && body) {
          options.headers = { "Content-Type": "application/json" };
          options.body = body;
        }

        const response = await fetch(url, options);
        const text = await response.text();

        let jsonData;
        try {
          jsonData = JSON.parse(text);
        } catch {
          jsonData = text;
        }

        statusDiv.textContent = `Status: ${response.status} ${response.statusText}`;
        headersDiv.innerHTML = "<strong>Headers:</strong><br>" + [...response.headers.entries()]
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");

        jsonDiv.textContent = typeof jsonData === "object"
          ? JSON.stringify(jsonData, null, 2)
          : jsonData;

      } catch (err) {
        statusDiv.textContent = "Error: " + err.message;
      }
    });