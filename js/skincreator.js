	let selectedTheme = 'default'; 


  // Create Bootstrap modal instance
  let loadModal;

  // ----- Color Functions -----
  function copyColor(inputId) {
    const inputElement = document.getElementById(inputId);
    navigator.clipboard.writeText(inputElement.value).catch((error) => {
      console.error("Failed to copy color:", error);
    });
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

  // Randomize colors in all color inputs based on the chosen theme
function randomizeColors(theme = 'default') {
  document.querySelectorAll('input.jscolor').forEach(colorInput => {
    let red, green, blue;
    if (theme === 'warm') {
      red   = Math.floor(Math.random() * 256);
      green = Math.floor(Math.random() * 200);
      blue  = Math.floor(Math.random() * 100);
    } else if (theme === 'cool') {
      red   = Math.floor(Math.random() * 100);
      green = Math.floor(Math.random() * 200);
      blue  = Math.floor(Math.random() * 256);
    } else if (theme === 'pastel') {
      red   = Math.floor(Math.random() * 128) + 127;
      green = Math.floor(Math.random() * 128) + 127;
      blue  = Math.floor(Math.random() * 128) + 127;
    } else {
      // default: full range
      red   = Math.floor(Math.random() * 256);
      green = Math.floor(Math.random() * 256);
      blue  = Math.floor(Math.random() * 256);
    }
    const randomColor = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
    colorInput.jscolor.fromString(randomColor);
  });
}

  // Button action to apply the selected theme
  function applyTheme() {
    if (!document.querySelector('.exclusive-checkbox:checked')) {
      alert('Please select a theme before applying.');
      return;
    }
    randomizeColors(selectedTheme);
  }

  // ----- Reset -----
  function resetColors() {
    document.querySelectorAll('input.jscolor').forEach(colorInput => {
      colorInput.jscolor.fromString("000000");
    });
    document.getElementById("sv").value = 0;
    document.getElementById("pi").value = 0;
    document.getElementById("output").textContent = "";
  }

  // ----- Output -----
  function generateOutput() {
	  console.log("generateOutput() called!");
    const colors = {
      sv: document.getElementById("sv").value,
      pi: document.getElementById("pi").value,
    };

    const colorIds = {
      md: "md-color",
      m:  "m-color",
      b:  "b-color",
      f:  "f-color",
      u:  "u-color",
      d1: "d1-color",
      e:  "e-color",
    };

    for (const [key, id] of Object.entries(colorIds)) {
      colors[key] = getColorValue(key, id);
    }

    const output = JSON.stringify(colors, null, 2).replace(/\"/g, "'");
     document.getElementById("output").textContent = output;
  console.log("Output is:", output)
  }

  // Reads a color from the normal color picker, optionally multiplies it if glitch is on
  function getColorValue(key, htmlId) {
    const glitchSwitch = document.getElementById(htmlId + '-glitch-switch');

    // Always get the color from the normal JSColor input
    const hex = document.getElementById(htmlId).jscolor.toHEXString();
    let r = parseInt(hex.substring(1, 3), 16) / 255;
    let g = parseInt(hex.substring(3, 5), 16) / 255;
    let b = parseInt(hex.substring(5, 7), 16) / 255;

    if (glitchSwitch && glitchSwitch.checked) {
      // Glitch mode => multiply each channel
      const xMult = parseFloat(document.getElementById(htmlId + '-multiplier-x').value) || 1;
      const yMult = parseFloat(document.getElementById(htmlId + '-multiplier-y').value) || 1;
      const zMult = parseFloat(document.getElementById(htmlId + '-multiplier-z').value) || 1;

      r *= xMult;
      g *= yMult;
      b *= zMult;
    }

    // Return final "X=..,Y=..,Z=.."
    return `X=${r.toFixed(3)},Y=${g.toFixed(3)},Z=${b.toFixed(3)}`;
  }

  // Copy JSON output to clipboard
  function copyToClipboard() {
    const output = document.getElementById("output").textContent;
    navigator.clipboard.writeText(output)
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

  // ----- Load From JSON -----
  function loadFromJson() {
    try {
      let jsonString = document.getElementById("paste-json").value.trim();
      jsonString = jsonString.replace(/'/g, '"');

      const json = JSON.parse(jsonString);
      const requiredKeys = ["sv", "pi", "md", "m", "b", "f", "u", "d1", "e"];

      for (const key of requiredKeys) {
        if (!(key in json)) {
          alert(`Missing key: ${key}`);
          throw new Error(`Missing key: ${key}`);
        }
      }

      document.getElementById("sv").value = json.sv;
      document.getElementById("pi").value = json.pi;

      const colorIds = {
        md: "md-color",
        m:  "m-color",
        b:  "b-color",
        f:  "f-color",
        u:  "u-color",
        d1: "d1-color",
        e:  "e-color",
      };

      for (const [key, id] of Object.entries(colorIds)) {
        if (key in json) {
          const matches = json[key].match(/X=([\d.]+),Y=([\d.]+),Z=([\d.]+)/);
          if (matches) {
            const [, r, g, b] = matches;
            const hexColor = rgbToHex(parseFloat(r), parseFloat(g), parseFloat(b));
            document.getElementById(id).jscolor.fromString(hexColor);
          }
        }
      }

      loadModal.hide();
    } catch (error) {
      console.error("Error loading JSON:", error);
      alert("Invalid JSON format. Please check your input.");
    }
  }

  // Helper to convert normalized floats to hex
  function rgbToHex(r, g, b) {
    const to255 = (value) => Math.min(Math.max(0, Math.round(value * 255)), 255);
    return `#${((1 << 24) + (to255(r) << 16) + (to255(g) << 8) + to255(b))
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  }

  // ----- Main DOMContentLoaded -----
  document.addEventListener('DOMContentLoaded', () => {
    // 1) Initialize Bootstrap Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));

    // 2) Create the Bootstrap modal instance
    loadModal = new bootstrap.Modal('#loadModal');

    // 3) Clear the textarea when the "Load JSON" modal closes
    document.getElementById('loadModal').addEventListener('hidden.bs.modal', () => {
      document.getElementById('paste-json').value = '';
    });

    // 4) Setup exclusive theme checkboxes
    document.querySelectorAll('.exclusive-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (event) => {
        if (event.target.checked) {
          document.querySelectorAll('.exclusive-checkbox').forEach(otherCheckbox => {
            if (otherCheckbox !== event.target) {
              otherCheckbox.checked = false;
            }
          });
          selectedTheme = event.target.value;
        }
      });
    });

    // 5) Glitch toggles show/hide multiplier fields
    const glitchSwitches = document.querySelectorAll('.glitch-switch');
    glitchSwitches.forEach(switchEl => {
      // e.g. "md-color" if switch is "md-color-glitch-switch"
      const baseId = switchEl.id.replace('-glitch-switch', '');
      const multiplierEl = document.getElementById(baseId + '-multiplier-fields');

      switchEl.addEventListener('change', () => {
        if (switchEl.checked) {
          multiplierEl.classList.remove('d-none');
        } else {
          multiplierEl.classList.add('d-none');
        }
      });
    });
  });