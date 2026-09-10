document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recovery-form");
  const status = document.getElementById("status");
  const answer = document.getElementById("answer");
  const submitButton = form.querySelector("button");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    status.textContent = "Working through your situation";
    answer.classList.remove("empty");
    answer.textContent = "Preparing practical next steps...";

    const payload = {
      username: document.getElementById("username").value.trim(),
      problem: document.getElementById("problem").value,
      details: document.getElementById("details").value.trim()
    };

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed.");
      status.textContent = "Your next steps";
      answer.textContent = data.answer;
    } catch (error) {
      status.textContent = "Something went wrong";
      answer.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });
});
