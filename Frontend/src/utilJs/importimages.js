export function importAllImages() {
  const modules = import.meta.glob("../assets/images/*.{png,jpg,jpeg,svg}", {
    eager: true,
  });

  let images = {};
  for (const path in modules) {
    const name = path.split("/").pop(); // just the filename
    images[name] = modules[path].default; // resolved URL
  }
  return images;
}
export function importAllAnimations() {
  const modules = import.meta.glob("../assets/SVG/*.{png,jpg,jpeg,svg}", {
    eager: true,
  });

  let images = {};
  for (const path in modules) {
    const name = path.split("/").pop(); // just the filename
    images[name] = modules[path].default; // resolved URL
  }
  return images;
}
