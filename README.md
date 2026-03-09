# WINNIE
### Web-based Institutional Nursing Name-list Issuance of E-Certificates

> A single-file, no-install web application for generating bulk PDF certificates — built for nursing and healthcare training institutions.

![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![No Backend](https://img.shields.io/badge/backend-none-brightgreen)
![Mobile Ready](https://img.shields.io/badge/mobile-ready-blueviolet)

---

## What is WINNIE?

WINNIE is a browser-based certificate generator designed for institutions that issue certificates in bulk — such as after nursing courses, in-service training, or continuing professional development programmes. It runs entirely in the browser with no server, no installation, and no internet connection required (after first load).

Everything lives in a single `index.html` file. Drop it on a web server alongside your background image and name list, and it's ready to use.

<img width="1202" height="893" alt="screenshot" src="https://github.com/user-attachments/assets/f85cf92c-0d2e-459a-bc3f-64176395a9df" />

---

## Features

- 🖼️ **Custom certificate background** — upload any JPG/PNG template, or use the auto-generated white + gold border fallback; remove it at any time to revert to the fallback
- 👥 **Bulk name list** — upload a `.txt`/`.csv` file or type names manually
- 📊 **CSV multi-column import** — extra columns in a CSV automatically become custom certificate fields with their own positioning controls
- ✏️ **Live preview** — see exactly how each certificate will look before generating; unchecked names are excluded from preview navigation
- ⚙️ **Field positioning** — adjust X-position, Y-position and font size for every field
- 👁️ **Field visibility** — toggle individual fields on or off
- 🎨 **Typography controls** — choose font family and text colour
- 📅 **Smart date formatting** — automatically formats single and ranged dates
- 🔢 **Auto-incrementing serial numbers** — with a customisable prefix
- 📦 **ZIP export** — download all certificates in one ZIP file, or combine them into a single multi-page PDF
- 💾 **Backup & Restore Dataset** — save your entire setup (settings + background + name list + custom fields) as a ZIP and restore it later
- 🔍 **Name list search** — live search with highlighted matches
- 🔽 **Name list filter** — filter the checklist by All, Checked, or Unchecked names
- 🚀 **Auto-loading** — automatically loads `default_background.jpg` and `namelist.txt` from the same folder on startup
- 🎨 **Fallback background** — if no `default_background.jpg` is found, a clean white certificate with a gold border is generated automatically
- 📲 **Mobile-optimised layout** — responsive 4-row interface on small screens: header, preview, section content, and tab bar

---

## File Structure

For the best experience, place these files together in the same directory:

```
your-folder/
├── index.html               ← WINNIE application
├── default_background.jpg   ← (optional) auto-loaded certificate background
└── namelist.txt             ← (optional) auto-loaded staff name list
```

---

## Installation & Setup

### Option A — Apache / Nginx Web Server (recommended)

This method enables auto-loading of `default_background.jpg` and `namelist.txt`.

1. Copy files to your web server root:
   ```bash
   sudo cp index.html /var/www/html/
   sudo cp default_background.jpg /var/www/html/      # optional
   sudo cp namelist.txt /var/www/html/                # optional
   ```

2. Set permissions:
   ```bash
   sudo chmod 644 /var/www/html/index.html
   sudo chmod 644 /var/www/html/default_background.jpg
   sudo chmod 644 /var/www/html/namelist.txt
   ```

3. Open in browser:
   ```
   http://your-server-ip/index.html
   ```

### Option B — VS Code Live Server (local development)

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code
2. Open the project folder in VS Code
3. Right-click `index.html` → **Open with Live Server**
4. Auto-loading of `default_background.jpg` and `namelist.txt` will work normally

### Option C — Open Directly (limited)

Simply double-click `index.html` to open it in a browser. All features work **except** auto-loading of `default_background.jpg` and `namelist.txt`, because browsers block local file access via `fetch()` for security reasons. You can still upload files manually.

---

## Tutorial

### Step 1 — Load a Certificate Background

WINNIE supports two ways to load a background:

**Auto-load (server setup)**
Place a file named `default_background.jpg` in the same folder as `index.html`. It will be detected and loaded automatically on startup.

**No file found — fallback background**
If `default_background.jpg` is not present, WINNIE automatically generates a clean white certificate background with a gold double-border and corner ornaments. This is fully functional and will be embedded into the generated PDFs.

**Manual upload**
In the **Background** section on the left panel, click the upload zone or drag and drop a JPG or PNG file onto it. An A4 portrait ratio (210 × 297 mm) is recommended for best results.

Once loaded, the background will immediately appear in the **Live Preview** panel on the right.

---

### Step 2 — Fill in Event Details

Expand the **Event Details** section and fill in:

| Field | Description | Example |
|---|---|---|
| Event Title | Name of the course or event | `KURSUS PEMANTAPAN KLINIKAL` |
| Organizer | Organising unit or department | `UNIT LATIHAN DALAM PERKHIDMATAN` |
| Location | Venue (optional, hidden by default) | `ILKKM TAWAU` |
| Date From | Start date of the event | `2025-10-12` |
| Date To | End date of the event (optional) | `2025-10-14` |
| Serial Prefix | Prefix for serial numbers | `ILKKMT/2025/` |
| Starting # | First serial number in the sequence | `1` |

**Date formatting is automatic:**
- Single day: `12 October 2025`
- Same month: `12 – 14 October 2025`
- Different months: `12 October – 3 November 2025`

---

### Step 3 — Configure Typography

Expand the **Typography** section to set:

- **Text Colour** — click the colour swatch or type a hex code (e.g. `#1a1a2e`)
- **Font Family** — choose between Helvetica, Times New Roman, or Courier

These settings apply to all text fields on every certificate.

---

### Step 4 — Load the Name List

WINNIE supports three ways to load names:

**Auto-load (server setup)**
Place a file named `namelist.txt` in the same folder as `index.html`. It will be detected, loaded into the textarea, and applied automatically on startup.

**Upload a file**
In the **Staff List** section, click the upload zone and select a `.txt` or `.csv` file.

**Type manually**
Type or paste names directly into the textarea — one name per line — then click **Apply List**.

**Supported formats:**
```
# One name per line (plain text)
JOHN DOE
JANE SMITH
AHMAD BIN ALI
SITI BINTI IBRAHIM

# Or comma-separated on one line
JOHN DOE, JANE SMITH, AHMAD BIN ALI
```

Names are automatically converted to uppercase and deduplicated.

---

### Step 4a — CSV Multi-Column Import

When you upload a `.csv` file with **two or more columns**, WINNIE treats the first row as headers and automatically creates custom certificate fields from every extra column beyond the first.

**Example CSV:**
```csv
Name,Designation,IC Number,Department
JOHN DOE,Staff Nurse,880101-XX-1234,Ward 3A
JANE SMITH,Senior Nurse,750515-XX-5678,ICU
AHMAD BIN ALI,Matron,700220-XX-9012,Emergency
```

In this example:
- **Column 1 (Name)** — used as the staff name on each certificate
- **Columns 2–4 (Designation, IC Number, Department)** — each becomes a new positionable field in the **Field Positions** section, tagged with `(CSV)` for easy identification

Each person's unique values are stored and rendered on their individual certificate. A banner appears in the Staff List section confirming how many columns were detected.

> 💡 Custom CSV fields are fully integrated — they appear in the live preview, in generated PDFs, and are preserved in backup/restore.

---

### Step 5 — Select Recipients

Once the name list is applied, a scrollable checklist appears.

**Selection buttons:**

| Button | Action |
|---|---|
| Select All | Tick all names |
| None | Untick all names |
| Invert | Flip the current selection |

**Filter dropdown** (next to Invert):

| Option | Shows |
|---|---|
| All | Every name in the list |
| ✓ Checked | Only currently selected names |
| ✗ Unchecked | Only currently unselected names |

You can also click individual names to toggle them. The header badge updates in real time to show how many are currently selected.

---

### Step 6 — Search the Name List

Use the **search box** below the selection buttons to find names quickly.

- Typing filters the list instantly — no need to press Enter
- Matching characters are **highlighted in gold**
- The status bar shows the number of matches, e.g. `24 people, 18 selected (3 shown)`
- Click **✕** to clear the search and return to the full list
- Search and the filter dropdown work together — e.g. search `"ahmad"` while filtering to **✗ Unchecked** to find unselected people by name

---

### Step 7 — Adjust Field Positions

Expand **Field Positions** to fine-tune the placement of each text element on the certificate. An A4 page is 210 mm wide × 297 mm tall.

| Field | Default X (mm) | Default Y (mm) | Default Size | Visible by Default |
|---|---|---|---|---|
| Staff Name | 105 | 123 | 20pt | ✅ |
| Event Title | 105 | 150 | 14pt | ✅ |
| Date | 105 | 178 | 13pt | ✅ |
| Organizer | 105 | 201 | 12pt | ✅ |
| Location | 105 | 225 | 12pt | ❌ |
| Serial Number | 105 | 278 | 8pt | ✅ |

For each field you can:
- **Toggle visibility** using the checkbox on the left
- **X (mm)** — distance from the left edge of the page (105 = horizontally centred on A4)
- **Y (mm)** — distance from the top of the page
- **pt** — font size in points

Any custom fields imported from a CSV will also appear here, tagged with `(CSV)`, under a separate **📊 CSV Custom Fields** divider.

> 💡 Changes reflect instantly in the Live Preview. Use the ◀ ▶ arrows to cycle through different names and check alignment before generating.

---

### Step 8 — Preview

The **Live Preview** panel on the right shows a full A4 rendering of the certificate for the currently previewed person. Use the **◀ ▶** navigation buttons to browse through the name list and verify that text is correctly positioned on your background template before generating.

---

### Step 9 — Generate Certificates

At the bottom of the preview panel (or in the **Generate** tab on mobile):

A confirmation popup will appear before generating, showing a summary of the event details, recipient count, and output format. Review and click **Proceed** to continue.

**Download Certificates**
1. Check **Bundle as ZIP** to package all PDFs into a single archive (recommended). Uncheck to download each PDF individually.
2. Click **Download Certificates**.
3. A progress overlay will show the current name being processed.
4. Once complete, the ZIP or individual PDFs will be downloaded automatically.

**Download as Single PDF**
Click **Download as Single PDF** to combine all selected certificates into one multi-page PDF file.

**Output file naming:**
- Individual PDF: `EVENTNAME-STAFF_NAME.pdf`
- ZIP archive: `EVENTNAME-YYYY-MM-DD.zip`
- Single combined PDF: `EVENTNAME-YYYY-MM-DD.pdf`

---

## Backup & Restore Dataset

WINNIE can save and restore your entire working setup — useful for recurring courses or sharing configurations between team members.

### Backup Dataset

Click **Backup Dataset** in the header (desktop) or in the **Generate** tab (mobile). A ZIP file will be downloaded containing:

- `certforge-data.json` — all event details, typography, field positions (including X/Y and custom CSV fields), and the full staff list with per-person custom data
- `background.jpg` / `background.png` — the certificate background image (if loaded)

The backup file is named: `EVENTNAME-backup-YYYY-MM-DD.zip`

### Restore Dataset

Click **Restore Dataset** in the header (desktop) or in the **Generate** tab (mobile), then select a previously saved backup ZIP. WINNIE will restore:

- All event fields and serial settings
- Text colour and font family
- All field X-positions, Y-positions, font sizes, and visibility states
- Custom CSV fields and their per-person values
- The staff name list and selection state
- The background image

> ✅ Backup files are fully self-contained — share them with colleagues to replicate your exact setup.

---

## Mobile Layout

On screens ≤768px wide, WINNIE switches to a mobile-optimised 4-row layout:

| Row | Content |
|---|---|
| 1 | Header — logo, selection count, reset button |
| 2 | Live preview (fixed, does not scroll) |
| 3 | Active section content (scrollable) |
| 4 | Section tab bar — Background, Event, Typography, Staff, Fields, Generate |

The **Generate** tab on mobile contains the download buttons, Bundle as ZIP toggle, and Backup/Restore controls.

---

## Troubleshooting

**Background or name list not auto-loading**
Auto-loading requires the HTML to be served over HTTP. Opening the file directly as `file://` will not work. Use a web server (Apache, Nginx) or VS Code Live Server.

**No background image — gold border appears instead**
This is expected behaviour. If `default_background.jpg` is not found, WINNIE generates a white certificate with a gold border automatically. Upload a background image manually or place `default_background.jpg` in the same folder.

**Text is misaligned on the certificate**
Adjust the X and Y position values in **Field Positions**. X = 105 is the horizontal centre of an A4 page. Preview with several different names before bulk generating, as name length can affect visual balance.

**PDF text colour looks wrong**
Ensure the hex code in **Typography → Text Colour** matches your certificate design. Light colours (e.g. white `#ffffff`) work better on dark backgrounds.

**Names appear in wrong case**
All names are auto-converted to uppercase. If you need mixed case, this behaviour is by design for consistency across certificates.

**CSV columns not detected**
Ensure your CSV file has at least two columns and a header row. The first column is always treated as the name. Single-column CSVs and plain `.txt` files fall back to standard one-name-per-line mode.

**Restore Dataset doesn't load my background**
The backup ZIP must have been created by WINNIE's **Backup Dataset** function. Manually created ZIPs will not be recognised.

**Search shows no results**
Check that the filter dropdown is set to **All** — if it's set to **✓ Checked** or **✗ Unchecked**, results are limited to that subset.

---

## Technologies Used

| Library | Purpose |
|---|---|
| [jsPDF](https://github.com/parallax/jsPDF) | PDF generation |
| [JSZip](https://stuk.github.io/jszip/) | ZIP creation and extraction |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js/) | File download trigger |
| [Google Fonts](https://fonts.google.com/) | DM Serif Display, DM Mono, DM Sans |

No npm. No build step. No backend. Everything loads from CDN.

---

## Browser Support

Chrome and Edge are recommended. Firefox and Safari are supported. A modern browser with ES6+ and Canvas API support is required.

---

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.

---

*Built for Institut Latihan Kementerian Kesihatan Malaysia (ILKKM) and healthcare training institutions.*
