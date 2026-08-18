// ---------- CONFIG ----------
// Point this at your deployed serverless function (see /api/solve.js).
// Example after deploying to Vercel: "https://your-project.vercel.app/api/solve"
const SOLVE_ENDPOINT = "/api/solve";

// ---------- Tab switching ----------
const tabs = document.querySelectorAll(".tab");
const panels = {
  keypad: document.getElementById("keypad-panel"),
  scan: document.getElementById("scan-panel"),
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    Object.values(panels).forEach((p) => p.classList.remove("active"));
    panels[tab.dataset.mode].classList.add("active");
  });
});

// ---------- Keypad calculator ----------
const expressionEl = document.getElementById("expression");

document.querySelectorAll(".buttons button[data-val]").forEach((btn) => {
  btn.addEventListener("click", () => {
    expressionEl.value += btn.dataset.val;
  });
});

document.getElementById("clear").addEventListener("click", () => {
  expressionEl.value = "";
});

document.getElementById("equals").addEventListener("click", () => {
  try {
    const result = math.evaluate(expressionEl.value);
    expressionEl.value = math.format(result, { precision: 12 });
  } catch (err) {
    expressionEl.value = "Error";
  }
});

// ---------- Scan / AI solve ----------
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const questionText = document.getElementById("questionText");
const solveBtn = document.getElementById("solveAI");
const statusEl = document.getElementById("aiStatus");
const resultEl = document.getElementById("aiResult");

let imageBase64 = null;

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imageBase64 = reader.result; // data:image/...;base64,....
    preview.src = imageBase64;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

solveBtn.addEventListener("click", async () => {
  const text = questionText.value.trim();

  if (!text && !imageBase64) {
    statusEl.textContent = "Add an image or type a question first.";
    return;
  }

  solveBtn.disabled = true;
  statusEl.textContent = "Solving...";
  resultEl.style.display = "none";

  try {
    const res = await fetch(SOLVE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text || null,
        image: imageBase64 || null,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    resultEl.textContent = data.answer;
    resultEl.style.display = "block";
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "Something went wrong: " + err.message;
  } finally {
    solveBtn.disabled = false;
  }
});
