const express = require("express");
const multer = require("multer");
const supabase = require("../supabaseClient");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Memory storage keeps file buffer in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// POST /upload/photo : Upload photo to Supabase storage or return base64
router.post("/photo", optionalAuth, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    const ext = req.file.mimetype.split("/")[1] || "jpeg";
    const filename = `grocery_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // Try uploading to Supabase Storage bucket 'grocery-photos'
    const { data, error } = await supabase.storage
      .from("grocery-photos")
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from("grocery-photos")
        .getPublicUrl(filename);

      return res.json({
        ok: true,
        url: publicUrlData.publicUrl,
        storage: "supabase",
      });
    }

    // Fallback: If bucket does not exist yet, return Data URI
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    res.json({
      ok: true,
      url: base64,
      storage: "data-uri",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
