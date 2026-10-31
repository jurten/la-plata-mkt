// Apply a saved appearance before the first content paint. Storage is optional.
try {
  const savedTheme = localStorage.getItem('lpm-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', savedTheme === 'dark' ? '#060917' : '#EEF2FF');
  }
} catch {
  // CSS still follows the system preference when storage is unavailable.
}
