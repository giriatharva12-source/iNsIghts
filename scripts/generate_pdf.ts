import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { SEED_QUESTIONS } from "../src/data/questions";

async function generatePDF() {
  const publicPdfPath = path.resolve(__dirname, "../public/INSIGHT_Questions_Bank.pdf");
  const rootPdfPath = path.resolve(__dirname, "../INSIGHT_Questions_Bank.pdf");

  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
    bufferPages: true,
  });

  const stream = fs.createWriteStream(publicPdfPath);
  doc.pipe(stream);

  // Group by category
  const categories = [
    "Funny",
    "Friendship",
    "Personality",
    "Embarrassing",
    "Relationships",
    "Childhood",
    "Deep",
    "Hypothetical",
    "Spicy",
    "Random",
  ];

  // Colors per category
  const categoryColors: Record<string, string> = {
    Funny: "#f97316", // Orange
    Friendship: "#8b5cf6", // Violet
    Personality: "#06b6d4", // Cyan
    Embarrassing: "#ec4899", // Pink
    Relationships: "#e11d48", // Rose
    Childhood: "#10b981", // Emerald
    Deep: "#3b82f6", // Blue
    Hypothetical: "#a855f7", // Purple
    Spicy: "#dc2626", // Red
    Random: "#d97706", // Amber
  };

  // COVER / HEADER SECTION
  doc.rect(40, 40, 515, 120).fill("#0c0a14");

  doc
    .fillColor("#a855f7")
    .fontSize(26)
    .font("Helvetica-Bold")
    .text("INSIGHT", 60, 55, { characterSpacing: 2 });

  doc
    .fillColor("#ffffff")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("PARTY GAME WITH FRIENDS", 60, 88);

  doc
    .fillColor("#ec4899")
    .fontSize(9)
    .font("Helvetica-Oblique")
    .text("Tagline: How well do your friends really know you?", 60, 105);

  doc
    .fillColor("#94a3b8")
    .fontSize(9)
    .font("Helvetica")
    .text(`Complete Built-In Question Bank • ${SEED_QUESTIONS.length} Original Questions • 10 Categories`, 60, 122);

  doc.moveDown(4.5);

  // Table of Categories Summary Box
  doc
    .fillColor("#1e1b4b")
    .rect(40, 175, 515, 60)
    .fill();

  doc
    .fillColor("#ffffff")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("CATEGORIES SUMMARY", 55, 185);

  doc
    .fillColor("#cbd5e1")
    .fontSize(8)
    .font("Helvetica")
    .text("• Funny (35)   • Friendship (35)   • Personality (35)   • Embarrassing (35)   • Relationships (35)", 55, 202);

  doc
    .fillColor("#cbd5e1")
    .fontSize(8)
    .font("Helvetica")
    .text("• Childhood (35)   • Deep (35)   • Hypothetical (30)   • Spicy 18+ (30)   • Random (15)", 55, 217);

  doc.y = 250;

  let globalIndex = 1;

  for (const cat of categories) {
    const catQuestions = SEED_QUESTIONS.filter((q) => q.category === cat);
    if (catQuestions.length === 0) continue;

    // Check page overflow for category header
    if (doc.y > 680) {
      doc.addPage();
    } else {
      doc.moveDown(1);
    }

    const headerColor = categoryColors[cat] || "#8b5cf6";

    // Category Header Box
    const headerY = doc.y;
    doc.rect(40, headerY, 515, 24).fill(headerColor);

    doc
      .fillColor("#ffffff")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`${cat.toUpperCase()} CATEGORY (${catQuestions.length} Questions)`, 50, headerY + 6);

    doc.y = headerY + 34;

    // List questions in this category
    for (const q of catQuestions) {
      if (doc.y > 720) {
        doc.addPage();
      }

      const qBoxY = doc.y;

      // Question Number & Intensity Badge
      doc
        .fillColor(headerColor)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`#${globalIndex}`, 45, qBoxY);

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica")
        .text(`[${q.intensity.toUpperCase()}]`, 75, qBoxY);

      // Question text
      doc
        .fillColor("#0f172a")
        .fontSize(9.5)
        .font("Helvetica")
        .text(q.text, 120, qBoxY, { width: 425 });

      // If has impostor prompt
      if (q.impostorPrompt) {
        doc
          .fillColor("#7c3aed")
          .fontSize(8)
          .font("Helvetica-Oblique")
          .text(`Blackout Clue: ${q.impostorPrompt}`, 120, doc.y + 1, { width: 425 });
      }

      doc.moveDown(0.5);
      globalIndex++;
    }
  }

  // Add Page Numbers
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc
      .fillColor("#94a3b8")
      .fontSize(8)
      .font("Helvetica")
      .text(
        `INSIGHT Party Game • Questions Bank • Page ${i + 1} of ${totalPages}`,
        40,
        doc.page.height - 25,
        { align: "center", width: doc.page.width - 80 }
      );
  }

  doc.end();

  await new Promise((resolve) => stream.on("finish", resolve));

  // Copy to root as well
  fs.copyFileSync(publicPdfPath, rootPdfPath);

  // Also copy to user desktop for convenience
  const desktopPath = path.resolve(process.env.USERPROFILE || "C:/Users/Asus", "Desktop/INSIGHT_Questions_Bank.pdf");
  try {
    fs.copyFileSync(publicPdfPath, desktopPath);
    console.log(`Copied to Desktop: ${desktopPath}`);
  } catch (err) {
    console.log("Desktop copy error:", err);
  }

  console.log(`PDF successfully created at: ${publicPdfPath}`);
  console.log(`Also copied to root: ${rootPdfPath}`);
}

generatePDF().catch(console.error);
