const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputDir = path.join(__dirname, "..", "frames-raw");
const outputDir = path.join(__dirname, "..", "public", "frames");

async function main() {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input folder not found: ${inputDir}`);
  }

  const files = fs.readdirSync(inputDir)
    .filter(name => /\.(png|jpe?g)$/i.test(name))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );

  if (files.length === 0) {
    throw new Error("No PNG/JPG frames found in client/frames-raw.");
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const existing = fs.readdirSync(outputDir)
    .filter(name => /^frame_\d+\.webp$/i.test(name));

  for (const name of existing) {
    fs.unlinkSync(path.join(outputDir, name));
  }

  let totalBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const input = path.join(inputDir, files[i]);
    const outputName = `frame_${String(i + 1).padStart(4, "0")}.webp`;
    const output = path.join(outputDir, outputName);

    await sharp(input)
      .webp({ quality: 75, effort: 5 })
      .toFile(output);

    totalBytes += fs.statSync(output).size;

    if ((i + 1) % 10 === 0 || i + 1 === files.length) {
      console.log(`Converted ${i + 1}/${files.length}`);
    }
  }

  console.log("\nConversion complete!");
  console.log(`Converted ${files.length} frames`);
  console.log(`Total size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Output folder: ${outputDir}`);

  if (totalBytes > 15 * 1024 * 1024) {
    console.log("SIZE LIMIT EXCEEDED: quality 65 par dobara convert karna hoga.");
  } else {
    console.log("SIZE CHECK PASSED: under 15 MB.");
  }
}

main().catch(error => {
  console.error("Conversion failed:", error.message);
  process.exitCode = 1;
});
