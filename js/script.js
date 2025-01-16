document.addEventListener("DOMContentLoaded", function () {
  const navbarPlaceholder = document.getElementById("navbar-placeholder");

  if (navbarPlaceholder) {
    fetch("navbar.html")
      .then(response => {
        if (!response.ok) throw new Error("Failed to load navbar");
        return response.text();
      })
      .then(data => {
        navbarPlaceholder.innerHTML = data;
      })
      .catch(error => {
        console.error("Error loading navbar:", error);
        navbarPlaceholder.innerHTML = `
          <p style="color: red; text-align: center;">Failed to load navigation menu. Please refresh the page.</p>`;
      });
  }
});

/*************************************************************
 * 1) GLOBAL VARIABLES & UTILITY FUNCTIONS
 *************************************************************/
let selectedTheme = 'default';
let loadModal;
// A global object to track which color inputs are locked
const locks = {};

/**
 * Converts #RRGGBB into gamma-corrected floats (approximately 2.2).
 * Useful because Unreal Engine color space expects linear values.
 */
function hexToGammaFloats(hex) {
  const r8 = parseInt(hex.slice(1, 3), 16) / 255;
  const g8 = parseInt(hex.slice(3, 5), 16) / 255;
  const b8 = parseInt(hex.slice(5, 7), 16) / 255;

  return {
    r: Math.pow(r8, 2.2),
    g: Math.pow(g8, 2.2),
    b: Math.pow(b8, 2.2),
  };
}

/**
 * Converts gamma floats back to #RRGGBB.
 * This reverses the 2.2 gamma correction and produces a standard sRGB hex.
 */
function gammaFloatsToHex(r, g, b) {
  const clamp = (value) => Math.min(Math.max(value, 0), 1);
  const r8 = Math.round(Math.pow(clamp(r), 1 / 2.2) * 255);
  const g8 = Math.round(Math.pow(clamp(g), 1 / 2.2) * 255);
  const b8 = Math.round(Math.pow(clamp(b), 1 / 2.2) * 255);

  return `#${((1 << 24) | (r8 << 16) | (g8 << 8) | b8).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Converts "X=0.123,Y=0.456,Z=0.789" into a standard #RRGGBB
 * by applying gammaFloatsToHex on those linear float values.
 */
function linearStringToHex(linearStr) {
  const matches = linearStr.match(/X=([\d.-]+),Y=([\d.-]+),Z=([\d.-]+)/);
  if (!matches) {
    console.warn("Invalid linear string format:", linearStr);
    return "#000000";
  }

  const rLin = parseFloat(matches[1]);
  const gLin = parseFloat(matches[2]);
  const bLin = parseFloat(matches[3]);

  return gammaFloatsToHex(rLin, gLin, bLin);
}

/*************************************************************
 * 2) COLOR PICKER, CLIPBOARD, AND EYE DROPPER
 *************************************************************/

/**
 * Copies the current color value in the specified input to the clipboard.
 */
function copyColor(inputId) {
  const inputElement = document.getElementById(inputId);
  navigator.clipboard
    .writeText(inputElement.value)
    .catch((error) => console.error("Failed to copy color:", error));
}

/**
 * Pastes a valid hex color from the clipboard into the specified color input.
 * If the clipboard is not a valid hex, it logs a warning.
 */
async function pasteColor(inputId) {
  try {
    const clipboardText = await navigator.clipboard.readText();
    const inputElement = document.getElementById(inputId);

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

/**
 * If supported by the browser, open an EyeDropper to select a color from the screen.
 * Applies the selected color to the specified color input.
 */
async function useEyeDropper(inputId) {
  if (window.EyeDropper) {
    const eyeDropper = new EyeDropper();
    try {
      const result = await eyeDropper.open();
      document.getElementById(inputId).jscolor.fromString(result.sRGBHex.substring(1));
    } catch (err) {
      console.error("EyeDropper cancelled", err);
    }
  } else {
    alert("The EyeDropper API is not supported in this browser.");
  }
}

/*************************************************************
 * 3) RANDOMIZATION & THEMES
 *************************************************************/

/**
 * Generates a random "neon-like" color by picking a hue and
 * forcing saturation and value to a high range.
 */
function randomNeonColor() {
  const h = Math.random() * 360;
  const s = 0.8 + Math.random() * 0.2;
  const v = 0.8 + Math.random() * 0.2;
  return hsvToHex(h, s, v);
}

/**
 * (Optional) If you have sliders named something like "md-color-hue",
 * "md-color-sat", "md-color-val", this updates the color in real time.
 */
function updateColorFromSliders(id) {
  const hue = parseInt(document.getElementById(id + '-hue').value, 10);
  const sat = parseFloat(document.getElementById(id + '-sat').value);
  const val = parseFloat(document.getElementById(id + '-val').value);
  const hex = hsvToHex(hue, sat, val);
  document.getElementById(id).jscolor.fromString(hex.replace('#',''));
}

/**
 * Converts an HSV triplet to a hex string (#RRGGBB).
 */
function hsvToHex(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r, g, b;
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  const hex = ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1).toUpperCase();

  return "#" + hex;
}

/**
 * Defines the themes and how each theme's colors are generated.
 * (Add or remove themes as you need.)
 */
const THEMES = {
  default: {
    generator: () => generateRandomRGB(256, 256, 256)
  },
  warm: {
    generator: () => generateRandomRGB(256, 200, 100)
  },
  cool: {
    generator: () => generateRandomRGB(100, 200, 256)
  },
  pastel: {
    generator: () => generatePastelRGB()
  },
  neon: {
    generator: () => randomNeonColor()
  },
  // Example theme using chroma.js:
  complementary: {
    generator: () => {
      // Make sure you include <script src="https://unpkg.com/chroma-js@2.4.2/chroma.min.js"></script> in your HTML
      const base = chroma.random();
      const comp = base.set('hsl.h', base.get('hsl.h') + 180);
      return comp.hex(); 
    }
  }
};

/**
 * Applies random colors based on the selected theme to every jscolor input,
 * unless that input is locked. Also includes optional glitch randomization.
 */
function randomizeColors(themeKey = 'default') {
  const theme = THEMES[themeKey] || THEMES.default;
  document.querySelectorAll('input.jscolor').forEach((colorInput) => {
    // Skip locked colors
    if (locks[colorInput.id]) return;
    
    // Apply a random color from the chosen theme
    const randomColor = theme.generator();
    colorInput.jscolor.fromString(randomColor.replace('#', ''));

    // If glitch mode is ON for this color, randomize the multipliers
    const baseId = colorInput.id;
    const glitchSwitch = document.getElementById(baseId + "-glitch-switch");
    if (glitchSwitch && glitchSwitch.checked) {
      randomizeGlitchMultipliers(baseId);
    }
  });
}

/**
 * Generates a random RGB color within user-specified max ranges (0..max).
 */
function generateRandomRGB(maxR, maxG, maxB) {
  const red = Math.floor(Math.random() * maxR);
  const green = Math.floor(Math.random() * maxG);
  const blue = Math.floor(Math.random() * maxB);

  return `#${((1 << 24) + (red << 16) + (green << 8) + blue)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

/**
 * Generates a random pastel color by picking random floats,
 * applying gamma, and then converting to sRGB hex.
 */
function generatePastelRGB() {
  const gammaCorrect = (value) => Math.pow(value, 2.2);
  const red = gammaCorrect(Math.random() * 0.5 + 0.5);
  const green = gammaCorrect(Math.random() * 0.5 + 0.5);
  const blue = gammaCorrect(Math.random() * 0.5 + 0.5);

  return gammaFloatsToHex(red, green, blue);
}

/**
 * If Glitch Mode is on, this picks random multiplier values
 * and applies them to the relevant multiplier fields.
 */
/**
 * Generates a random floating-point number for glitch effects.
 * - Higher chance of generating larger numbers (1.000–5.500) based on a threshold.
 * - Smaller numbers (0.001–1.000) generated otherwise.
 */
function randomFloat() {
  const c = Math.floor(Math.random() * 1000); // Random integer between 0 and 1000
  let f;
  if (c > 350) {
    f = Math.random() * (5.5 - 1.0) + 1.0; // Random float between 1.000 and 5.500
  } else {
    f = Math.random() * (1.0 - 0.001) + 0.001; // Random float between 0.001 and 1.000
  }
  return parseFloat(f.toFixed(4)); // Round to 4 decimal places
}

/**
 * Randomizes glitch multipliers using `randomFloat()`.
 */
function randomizeGlitchMultipliers(baseId) {
  const xMultField = document.getElementById(baseId + "-multiplier-x");
  const yMultField = document.getElementById(baseId + "-multiplier-y");
  const zMultField = document.getElementById(baseId + "-multiplier-z");

  xMultField.value = randomFloat();
  yMultField.value = randomFloat();
  zMultField.value = randomFloat();
}

/**
 * Generates a glitchy skin with random values for X, Y, Z.
 * - Uses `randomFloat()` to create "glitchy" random colors.
 * - Incorporates glitch effects for all components.
 */
function generateGlitchSkin() {
  const skin = {
    sv: 0,
    pi: 2,
    md: `X=${randomFloat()},Y=${randomFloat()},Z=${randomFloat()}`,
    m: `X=${randomFloat()},Y=${randomFloat()},Z=${randomFloat()}`,
    b: `X=${randomFloat()},Y=${randomFloat()},Z=${randomFloat()}`,
    f: `X=${randomFloat()},Y=${randomFloat()},Z=${randomFloat()}`,
    u: `X=${randomFloat()},Y=${randomFloat()},Z=${randomFloat()}`,
    d1: `X=${randomFloat()},Y=${randomFloat()},Z=${randomFloat()}`,
    e: `X=${randomFloat()},Y=${randomFloat()},Z=${randomFloat()}`,
  };

  // Generate single-quoted JSON for compatibility
  const output = JSON.stringify(skin, null, 2).replace(/\"/g, "'");
  document.getElementById("output").textContent = output;
  return output;
}

/**
 * Modifies `getColorValue()` to integrate `randomFloat()` for glitch multipliers.
 * Applies glitch mode and uses `randomFloat()` for random X, Y, Z values.
 */
function getColorValue(key, htmlId) {
  const glitchSwitch = document.getElementById(htmlId + "-glitch-switch");
  const hex = document.getElementById(htmlId).jscolor.toHEXString();

  let { r, g, b } = hexToGammaFloats(hex);

  if (glitchSwitch && glitchSwitch.checked) {
    // Use randomFloat() instead of static multipliers
    r *= randomFloat();
    g *= randomFloat();
    b *= randomFloat();
  }

  return `X=${r.toFixed(3)},Y=${g.toFixed(3)},Z=${b.toFixed(3)}`;
}

/**
 * Updates randomizeColors to support glitchy skins dynamically.
 * Includes the ability to apply random glitch effects.
 */
function randomizeColorsWithGlitch(themeKey = 'default') {
  const theme = THEMES[themeKey] || THEMES.default;
  document.querySelectorAll("input.jscolor").forEach((colorInput) => {
    const baseId = colorInput.id;

    // Skip locked colors
    if (locks[baseId]) return;

    // Apply a random color from the theme
    const randomColor = theme.generator();
    colorInput.jscolor.fromString(randomColor.replace('#', ''));

    // Apply glitch multipliers if the glitch switch is active
    const glitchSwitch = document.getElementById(baseId + "-glitch-switch");
    if (glitchSwitch && glitchSwitch.checked) {
      randomizeGlitchMultipliers(baseId);
    }
  });
}

// Example: Call this function to generate and display a glitch skin
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("generate-button").addEventListener("click", () => {
    const glitchOutput = generateGlitchSkin();
    console.log("Generated Glitch Skin:", glitchOutput);
  });
});


/**
 * Randomizes colors based on the currently selected theme (checkbox).
 */
/*
function applyTheme() {
  const isChecked = document.querySelector(".exclusive-checkbox:checked");
  if (!isChecked) {
    alert("Please select a theme before applying.");
    return;
  }
  randomizeColors(selectedTheme);
}
*/

/*************************************************************
 * 4) RESET, OUTPUT, LOAD/SAVE JSON, & PRESETS
 *************************************************************/

/**
 * Resets all color inputs to black, resets marks/pattern,
 * clears the JSON output, and hides glitch fields.
 */
function resetColors() {
  // Reset color pickers to black
  document.querySelectorAll("input.jscolor").forEach((colorInput) => {
    colorInput.jscolor.fromString("000000");
  });

  // Reset Marks & Pattern
  document.getElementById("sv").value = 0;
  document.getElementById("pi").value = 0;

  // Clear output
  document.getElementById("output").textContent = "";

  // Turn off glitch toggles and reset multipliers to 1
  document.querySelectorAll(".glitch-switch").forEach((switchEl) => {
    switchEl.checked = false;
    const baseId = switchEl.id.replace("-glitch-switch", "");
    const multiplierEl = document.getElementById(baseId + "-multiplier-fields");
    multiplierEl.classList.add("d-none");
    document.getElementById(baseId + "-multiplier-x").value = 1;
    document.getElementById(baseId + "-multiplier-y").value = 1;
    document.getElementById(baseId + "-multiplier-z").value = 1;
  });
}

/**
 * Gathers all the current color data into a single object,
 * converts double quotes to single quotes for Discord,
 * and displays it in the #output element.
 */
function generateOutput() {
  console.log("generateOutput() called!");

  // Parse sv and pi as numbers (using parseInt or parseFloat as needed)
  const svValue = parseInt(document.getElementById("sv").value) || 0;
  const piValue = parseInt(document.getElementById("pi").value) || 0;

  const colors = {
    sv: svValue,  // now a real number
    pi: piValue,  // now a real number
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

  // Now use JSON.stringify and then replace double quotes with single quotes.
  // That yields something like { 'sv': 0, 'pi': 0, 'md': 'X=...' }
  const output = JSON.stringify(colors, null, 2).replace(/"/g, "'");
  document.getElementById("output").textContent = output;
  console.log("Output is:", output);
}


/**
 * Converts a color from #RRGGBB to gamma floats, applies glitch multipliers if on,
 * and returns the final linear string in the format "X=0.###,Y=0.###,Z=0.###".
 */
function getColorValue(key, htmlId) {
  const glitchSwitch = document.getElementById(htmlId + "-glitch-switch");
  const hex = document.getElementById(htmlId).jscolor.toHEXString();

  let { r, g, b } = hexToGammaFloats(hex);

  if (glitchSwitch && glitchSwitch.checked) {
    const xMult = parseFloat(document.getElementById(htmlId + "-multiplier-x").value) || 1;
    const yMult = parseFloat(document.getElementById(htmlId + "-multiplier-y").value) || 1;
    const zMult = parseFloat(document.getElementById(htmlId + "-multiplier-z").value) || 1;

    r *= xMult;
    g *= yMult;
    b *= zMult;
  }

  return `X=${r.toFixed(3)},Y=${g.toFixed(3)},Z=${b.toFixed(3)}`;
}

/**
 * Copies the generated JSON to the clipboard, then briefly shows a confirmation message.
 */
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

/**
 * Parses the JSON from the Load JSON modal (which might use single quotes),
 * updates each color input, and sets the color accordingly.
 */
function loadFromJson() {
  try {
    const jsonString = document.getElementById("paste-json").value.trim();
    const json = JSON.parse(jsonString.replace(/'/g, '"')); // Convert single quotes
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
      if (!(key in json)) {
        console.error(`Key ${key} missing in JSON. Skipping...`);
        continue;
      }
      const linearStr = json[key];
      const hexColor = linearStringToHex(linearStr);
      document.getElementById(id).jscolor.fromString(hexColor.replace("#", ""));
      
      // If you want to show a preview box, uncomment and ensure there's a matching element:
      // renderColorPreview(linearStr, id + "-preview");
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
    alert("Invalid JSON format. Please check your input.");
  }
}

/**
 * Allows user to save the current color setup to localStorage under a chosen name.
 * They can later load it if a 'loadCurrentPreset' function is implemented.
 */
function saveCurrentPreset(name, colors) {
  const allPresets = JSON.parse(localStorage.getItem('presets') || '{}');
  allPresets[name] = colors;
  localStorage.setItem('presets', JSON.stringify(allPresets));
}

/*************************************************************
 * 5) LOCK/UNLOCK HANDLING
 *************************************************************/

/**
 * Toggles the locked state of a given color input. Locked inputs won't randomize.
 */
function toggleLock(colorId) {
  locks[colorId] = !locks[colorId];
  const btn = document.getElementById(colorId + "-lock");
  const input = document.getElementById(colorId);

  if (locks[colorId]) {
    btn.innerHTML = '<i class="fas fa-lock"></i>';
    input.classList.add("locked-input");
    btn.classList.remove("btn-outline-light");
    btn.classList.add("btn-danger");
  } else {
    btn.innerHTML = '<i class="fas fa-lock-open"></i>';
    input.classList.remove("locked-input");
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-outline-light");
  }
}

/*************************************************************
 * 6) DOMContentLoaded SETUP
 *************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle='tooltip']"));
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));

  // Create the Bootstrap modal instance for "Load JSON"
  loadModal = new bootstrap.Modal("#loadModal");

  // Clear the textarea when the "Load JSON" modal closes
  document.getElementById("loadModal").addEventListener("hidden.bs.modal", () => {
    document.getElementById("paste-json").value = "";
  });

  // Glitch toggles: show or hide the multiplier fields
  const glitchSwitches = document.querySelectorAll(".glitch-switch");
  glitchSwitches.forEach((switchEl) => {
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
