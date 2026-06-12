const STORAGE_KEY = "streamyt-theme";

// index.html applies the saved theme before first paint; these helpers keep
// the <html data-theme> attribute and localStorage in sync afterwards.
export const getTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export const setTheme = (theme) => {
  if (theme === "dark") {
    document.documentElement.dataset.theme = "dark";
  } else {
    delete document.documentElement.dataset.theme;
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#111714" : "#F6F2EA");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode); theme still applies for this visit.
  }
};
