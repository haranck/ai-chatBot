async function runTest() {
  const message = "hello what is javascript";

  console.log("=== Testing AI Chat API ===");
  console.log("Sending prompt:", message);
  console.log("Endpoint: http://localhost:3000/api/chat\n");

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    console.log("--- Response Status:", response.status, "---");
    console.log("Success:", data.success);
    console.log("\n--- AI Reply ---");
    console.log(data.reply || data.error || data);
  } catch (error) {
    console.error("Failed to connect to API:", error.message);
  }
}

runTest();
