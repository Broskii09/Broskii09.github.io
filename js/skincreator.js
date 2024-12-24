  /*************************************************************
   * 1) GLOBALS & HELPER FUNCTIONS
   *************************************************************/
  let selectedTheme = 'default';
let loadModal;

/**
 * Convert #RRGGBB into gamma-corrected floats, i.e. (0..1) ^ 2.2
 */
function hexToGammaFloats(hex) {
  // parse #RRGGBB
  const r8 = parseInt(hex.slice(1, 3), 16);
  const g8 = parseInt(hex.slice(3, 5), 16);
  const b8 = parseInt(hex.slice(5, 7), 16);

  // convert to linear space (gamma)
  const rLin = Math.pow(r8 / 255, 2.2);
  const gLin = Math.pow(g8 / 255, 2.2);
  const bLin = Math.pow(b8 / 255, 2.2);

  return {
    r: rLin,
    g: gLin,
    b: bLin
  };
}

/**
 * Convert gamma floats (rLin,gLin,bLin) back to #RRGGBB
 */
function gammaFloatsToHex(rLin, gLin, bLin) {
  // inverse gamma => (channel^(1/2.2))*255
  const r8 = Math.round(Math.pow(rLin, 1 / 2.2) * 255);
  const g8 = Math.round(Math.pow(gLin, 1 / 2.2) * 255);
  const b8 = Math.round(Math.pow(bLin, 1 / 2.2) * 255);

  const hex =
    "#"
    + ((1 << 24) + (r8 << 16) + (g8 << 8) + b8)
    .toString(16)
    .slice(1)
    .toUpperCase();

  return hex;
}

/**
 * Convert a linear string "X=0.123,Y=0.456,Z=0.789" to #RRGGBB
 */
function linearStringToHex(linearStr) {
  const matches = linearStr.match(/X=([\d.]+),Y=([\d.]+),Z=([\d.]+)/);
  if (!matches) {
    return "#000000"; // fallback if no match
  }

  const rLin = parseFloat(matches[1]);
  const gLin = parseFloat(matches[2]);
  const bLin = parseFloat(matches[3]);

  return gammaFloatsToHex(rLin, gLin, bLin);
}

/*************************************************************
 * 2) COLOR / EYE DROPPER / COPY / PASTE FUNCTIONS
 *************************************************************/

function copyColor(inputId) {
  const inputElement = document.getElementById(inputId);
  navigator.clipboard
    .writeText(inputElement.value)
    .catch((error) => console.error("Failed to copy color:", error));
}

async function pasteColor(inputId) {
  try {
    const clipboardText = await navigator.clipboard.readText();
    const inputElement = document.getElementById(inputId);

    // Validate if the clipboard text is a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(clipboardText)) {
      inputElement.value = clipboardText;
      inputElement.jscolor.fromString(clipboardText.replace("#", ""));
    } else {
      console.warn("Clipboard content is not a valid hex color.");
    }
  } catch (error) {
    console.error("Failed to paste color:", error);
  }
}

async function useEyeDropper(inputId) {
  if (window.EyeDropper) {
    const eyeDropper = new EyeDropper();
    try {
      const result = await eyeDropper.open();
      document.getElementById(inputId).jscolor.fromString(result.sRGBHex.substring(1));
    } catch (err) {
      console.error("Eyedropper cancelled", err);
    }
  } else {
    alert("The EyeDropper API is not supported in this browser.");
  }
}

/*************************************************************
 * 3) RANDOMIZATION + THEME
 *************************************************************/

/**
 * Randomize colors in all color inputs based on the chosen theme.
 * 
 * If you want the randomization to keep using the currently 
 * selected theme, call: randomizeColors(selectedTheme).
 */
function randomizeColors(theme = "default") {
  document.querySelectorAll("input.jscolor").forEach((colorInput) => {
    let red, green, blue;

    if (theme === "warm") {
      red = Math.floor(Math.random() * 256);
      green = Math.floor(Math.random() * 200);
      blue = Math.floor(Math.random() * 100);
    } else if (theme === "cool") {
      red = Math.floor(Math.random() * 100);
      green = Math.floor(Math.random() * 200);
      blue = Math.floor(Math.random() * 256);
    } else if (theme === "pastel") {
      red = Math.floor(Math.random() * 128) + 127;
      green = Math.floor(Math.random() * 128) + 127;
      blue = Math.floor(Math.random() * 128) + 127;
    } else {
      // default: full range
      red = Math.floor(Math.random() * 256);
      green = Math.floor(Math.random() * 256);
      blue = Math.floor(Math.random() * 256);
    }

    // Construct a #RRGGBB
    const randomColor = `#${(
        (1 << 24) +
        (red << 16) +
        (green << 8) +
        blue
      )
        .toString(16)
        .slice(1)}`;
    colorInput.jscolor.fromString(randomColor);
  });
}

function applyTheme() {
  // If none is checked, optional safety
  if (!document.querySelector(".exclusive-checkbox:checked")) {
    alert("Please select a theme before applying.");
    return;
  }
  randomizeColors(selectedTheme);
}

/*************************************************************
 * 4) RESET + OUTPUT + LOAD/SAVE JSON
 *************************************************************/

function resetColors() {
  document.querySelectorAll("input.jscolor").forEach((colorInput) => {
    colorInput.jscolor.fromString("000000");
  });
  document.getElementById("sv").value = 0;
  document.getElementById("pi").value = 0;
  document.getElementById("output").textContent = "";
}

function generateOutput() {
  console.log("generateOutput() called!");
  const colors = {
    sv: document.getElementById("sv").value,
    pi: document.getElementById("pi").value,
  };

  const colorIds = {
    md: "md-color",
    m: "m-color",
    b: "b-color",
    f: "f-color",
    u: "u-color",
    d1: "d1-color",
    e: "e-color",
  };

  for (const [key, id] of Object.entries(colorIds)) {
    colors[key] = getColorValue(key, id);
  }

  const output = JSON.stringify(colors, null, 2).replace(/\"/g, "'");
  document.getElementById("output").textContent = output;
  console.log("Output is:", output);
}

/**
 * Convert the color from #RRGGBB => gamma floats => optional glitch => final "X=...,Y=...,Z=..."
 */
function getColorValue(key, htmlId) {
  const glitchSwitch = document.getElementById(htmlId + "-glitch-switch");

  // Grab hex from jscolor
  const hex = document.getElementById(htmlId).jscolor.toHEXString();

  // Convert #RRGGBB => gamma floats
  let {
    r,
    g,
    b
  } = hexToGammaFloats(hex);

  // If glitch mode is ON => multiply each channel
  if (glitchSwitch && glitchSwitch.checked) {
    const xMult =
      parseFloat(document.getElementById(htmlId + "-multiplier-x").value) || 1;
    const yMult =
      parseFloat(document.getElementById(htmlId + "-multiplier-y").value) || 1;
    const zMult =
      parseFloat(document.getElementById(htmlId + "-multiplier-z").value) || 1;

    r *= xMult;
    g *= yMult;
    b *= zMult;
  }

  // Return final "X=..,Y=..,Z=.."
  return `X=${r.toFixed(3)},Y=${g.toFixed(3)},Z=${b.toFixed(3)}`;
}

function copyToClipboard() {
  const output = document.getElementById("output").textContent;
  navigator.clipboard
    .writeText(output)
    .then(() => {
      const notification = document.getElementById("modal-footer-notification");
      notification.textContent = "Copied to clipboard!";
      notification.classList.remove("d-none");
      setTimeout(() => {
        notification.classList.add("d-none");
        notification.textContent = "";
      }, 2000);
    })
    .catch(console.error);
}

function loadFromJson() {
  try {
    let jsonString = document.getElementById("paste-json").value.trim();
    // convert single quotes to double
    jsonString = jsonString.replace(/'/g, '"');

    const json = JSON.parse(jsonString);
    const requiredKeys = ["sv", "pi", "md", "m", "b", "f", "u", "d1", "e"];
    for (const key of requiredKeys) {
      if (!(key in json)) {
        alert(`Missing key: ${key}`);
        throw new Error(`Missing key: ${key}`);
      }
    }

    // set Marks & Pattern
    document.getElementById("sv").value = json.sv;
    document.getElementById("pi").value = json.pi;

    // load each color
    const colorIds = {
      md: "md-color",
      m: "m-color",
      b: "b-color",
      f: "f-color",
      u: "u-color",
      d1: "d1-color",
      e: "e-color",
    };

    for (const [key, id] of Object.entries(colorIds)) {
      const linearStr = json[key]; // e.g. 'X=0.123,Y=0.456,Z=0.789'
      const hexColor = linearStringToHex(linearStr); // => #RRGGBB
      // set in jscolor
      document.getElementById(id).jscolor.fromString(hexColor.replace("#", ""));
    }

    loadModal.hide();
  } catch (error) {
    console.error("Error loading JSON:", error);
    alert("Invalid JSON format. Please check your input.");
  }
}

/*************************************************************
 * 5) DOMContentLoaded
 *************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // 1) Initialize Bootstrap Tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll("[data-bs-toggle='tooltip']")
  );
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));

  // 2) Create the Bootstrap modal instance for "Load JSON"
  loadModal = new bootstrap.Modal("#loadModal");

  // 3) Clear the textarea when the "Load JSON" modal closes
  document
    .getElementById("loadModal")
    .addEventListener("hidden.bs.modal", () => {
      document.getElementById("paste-json").value = "";
    });

  // 4) Setup exclusive theme checkboxes
  //    This updates 'selectedTheme' whenever a user checks a box
  document.querySelectorAll(".exclusive-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        // uncheck all others
        document.querySelectorAll(".exclusive-checkbox").forEach((other) => {
          if (other !== event.target) {
            other.checked = false;
          }
        });
        // store the selected theme
        selectedTheme = event.target.value;
      }
    });
  });

  // 5) Glitch toggles: show/hide the multiplier fields
  const glitchSwitches = document.querySelectorAll(".glitch-switch");
  glitchSwitches.forEach((switchEl) => {
    // e.g. "md-color" if the switch is "md-color-glitch-switch"
    const baseId = switchEl.id.replace("-glitch-switch", "");
    const multiplierEl = document.getElementById(baseId + "-multiplier-fields");

    switchEl.addEventListener("change", () => {
      if (switchEl.checked) {
        multiplierEl.classList.remove("d-none");
      } else {
        multiplierEl.classList.add("d-none");
      }
    });
  });
});