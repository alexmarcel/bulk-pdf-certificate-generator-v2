<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WINNIE — Web-based Institutional Nursing Name-list Issuance of E-Certificates</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">

<style>
  :root {
    --bg: #0e0e10;
    --surface: #17171a;
    --surface2: #1f1f24;
    --surface3: #28282f;
    --border: #2e2e38;
    --accent: #c8a96e;
    --accent2: #7b6cd4;
    --text: #e8e8f0;
    --text-muted: #7a7a8e;
    --text-dim: #4a4a5a;
    --success: #4caf7d;
    --danger: #e05c5c;
    --radius: 10px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* HEADER */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .logo {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .logo-title {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: var(--accent);
    letter-spacing: -0.3px;
  }

  .logo-sub {
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .btn-backup {
    background: linear-gradient(135deg, #1a1a24 0%, #22202e 100%);
    color: var(--accent);
    border: 1px solid rgba(200, 169, 110, 0.35);
    position: relative;
    overflow: hidden;
    letter-spacing: 0.3px;
    transition: all 0.2s;
  }
  .btn-backup::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(200,169,110,0.12), rgba(123,108,212,0.08));
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .btn-backup:hover::before { opacity: 1; }
  .btn-backup:hover {
    border-color: rgba(200,169,110,0.7);
    color: #e8d49a;
    box-shadow: 0 0 14px rgba(200,169,110,0.22), inset 0 1px 0 rgba(200,169,110,0.12);
    transform: translateY(-1px);
  }
  .btn-backup:active { transform: translateY(0); box-shadow: none; }

  .btn-restore {
    background: linear-gradient(135deg, #141a22 0%, #1a2230 100%);
    color: #6ab0e8;
    border: 1px solid rgba(106, 176, 232, 0.3);
    position: relative;
    overflow: hidden;
    letter-spacing: 0.3px;
    transition: all 0.2s;
    cursor: pointer;
  }
  .btn-restore::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(106,176,232,0.1), rgba(123,108,212,0.08));
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .btn-restore:hover::before { opacity: 1; }
  .btn-restore:hover {
    border-color: rgba(106,176,232,0.65);
    color: #98ccf5;
    box-shadow: 0 0 14px rgba(106,176,232,0.2), inset 0 1px 0 rgba(106,176,232,0.12);
    transform: translateY(-1px);
  }
  .btn-restore:active { transform: translateY(0); box-shadow: none; }

  .btn-divider {
    width: 1px;
    height: 20px;
    background: var(--border);
    margin: 0 2px;
    flex-shrink: 0;
  }

  /* LAYOUT */
  .layout {
    display: grid;
    grid-template-columns: 360px 1fr;
    height: calc(100vh - 65px);
  }

  .panel-left {
    overflow-y: auto;
    border-right: 1px solid var(--border);
    background: var(--surface);
  }

  .panel-right {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* SECTIONS */
  .section {
    border-bottom: 1px solid var(--border);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }

  .section-header:hover { background: var(--surface2); }

  .section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--text-muted);
  }

  .section-label .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
  }

  .section-toggle {
    font-size: 10px;
    color: var(--text-dim);
    transition: transform 0.2s;
  }

  .section-toggle.open { transform: rotate(180deg); }

  .section-body {
    padding: 16px 20px 20px;
    display: none;
    animation: fadeIn 0.15s ease;
  }

  .section-body.open { display: block; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

  /* FORM ELEMENTS */
  .field-row {
    margin-bottom: 14px;
  }

  label {
    display: block;
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 5px;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  input[type="text"],
  input[type="number"],
  input[type="date"],
  textarea,
  select {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 8px 11px;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }

  input:focus, textarea:focus, select:focus {
    border-color: var(--accent);
    background: var(--surface3);
  }

  textarea { resize: vertical; min-height: 100px; }

  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  /* BUTTONS */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--accent);
    color: #0e0e10;
    font-weight: 600;
  }
  .btn-primary:hover { background: #d9ba80; }

  .btn-ghost {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { background: var(--surface2); color: var(--text); }

  .btn-danger {
    background: transparent;
    color: var(--danger);
    border: 1px solid var(--danger);
  }
  .btn-danger:hover { background: var(--danger); color: #fff; }

  .btn-success {
    background: var(--success);
    color: #0e0e10;
    font-weight: 600;
  }
  .btn-success:hover { background: #5cc98e; }

  .btn-sm { padding: 5px 11px; font-size: 12px; }
  .btn-lg { padding: 12px 28px; font-size: 15px; }

  .btn-group {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  /* FILE UPLOAD */
  .upload-zone {
    border: 1.5px dashed var(--border);
    border-radius: var(--radius);
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--accent);
    background: rgba(200, 169, 110, 0.05);
  }

  .upload-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
  }

  .upload-icon { font-size: 24px; margin-bottom: 6px; }
  .upload-text { font-size: 12px; color: var(--text-muted); }
  .upload-hint { font-size: 11px; color: var(--text-dim); margin-top: 3px; }

  /* STAFF LIST */
  .staff-list-container {
    max-height: 220px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface2);
    margin-top: 10px;
  }

  .staff-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    transition: background 0.1s;
    cursor: pointer;
    font-size: 13px;
  }

  .staff-item:last-child { border-bottom: none; }
  .staff-item:hover { background: var(--surface3); }
  .staff-item.selected { background: rgba(200, 169, 110, 0.08); }

  .staff-item input[type="checkbox"] { accent-color: var(--accent); }

  .staff-num {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--text-dim);
    min-width: 24px;
  }

  .staff-count {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 6px;
    font-family: 'DM Mono', monospace;
  }

  /* FIELD CONTROLS */
  .field-control {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-bottom: 6px;
    transition: border-color 0.15s;
  }

  .field-control:has(input[type="checkbox"]:checked) {
    border-color: var(--accent);
    background: rgba(200, 169, 110, 0.04);
  }

  .field-control input[type="checkbox"] { accent-color: var(--accent); flex-shrink: 0; }

  .field-name {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
  }

  .field-inputs {
    display: flex;
    gap: 4px;
  }

  .field-mini {
    width: 46px !important;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 11px !important;
    padding: 4px 4px !important;
  }

  .field-mini-label {
    font-size: 9px;
    color: var(--text-dim);
    text-align: center;
    margin-top: 2px;
  }

  /* PREVIEW AREA */
  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .preview-label {
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 600;
  }

  .preview-nav {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .preview-nav span {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--text-muted);
    min-width: 60px;
    text-align: center;
  }

  .preview-wrap {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background: repeating-linear-gradient(
      45deg,
      var(--bg),
      var(--bg) 10px,
      rgba(255,255,255,0.01) 10px,
      rgba(255,255,255,0.01) 20px
    );
  }

  #previewCanvas {
    max-width: 100%;
    border-radius: 4px;
    box-shadow: 0 20px 80px rgba(0,0,0,0.6), 0 0 0 1px var(--border);
  }

  /* GENERATE FOOTER */
  .generate-bar {
    padding: 14px 20px;
    border-top: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }

  .generate-bar .checkbox-wrap {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: var(--text-muted);
    cursor: pointer;
  }

  .generate-bar input[type="checkbox"] { accent-color: var(--accent); }

  /* PROGRESS */
  .progress-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(14,14,16,0.9);
    z-index: 999;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
  }

  .progress-overlay.show { display: flex; }

  .progress-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 40px 48px;
    text-align: center;
    min-width: 340px;
  }

  .progress-title {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: var(--accent);
    margin-bottom: 6px;
  }

  .progress-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 24px;
    font-family: 'DM Mono', monospace;
  }

  .progress-bar-wrap {
    background: var(--surface3);
    border-radius: 100px;
    height: 6px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 100px;
    transition: width 0.2s;
    width: 0%;
  }

  .progress-stats {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--text-muted);
  }

  /* TOAST */
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .toast {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideUp 0.2s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  .toast.success { border-color: var(--success); }
  .toast.error { border-color: var(--danger); }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }

  /* SEARCH */
  .search-wrap {
    display: flex;
    align-items: center;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0 10px;
    gap: 7px;
    margin-bottom: 6px;
    transition: border-color 0.15s;
  }

  .search-wrap:focus-within {
    border-color: var(--accent);
    background: var(--surface3);
  }

  .search-icon { font-size: 12px; flex-shrink: 0; opacity: 0.6; }

  .search-wrap input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 7px 0;
    font-size: 13px;
    color: var(--text);
    outline: none;
    font-family: 'DM Sans', sans-serif;
    width: 100%;
  }

  .search-clear {
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 11px;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
    display: none;
    line-height: 1;
    transition: color 0.15s;
    flex-shrink: 0;
  }

  .search-clear:hover { color: var(--danger); }
  .search-clear.visible { display: block; }

  .filter-select {
    padding: 5px 8px !important;
    font-size: 12px !important;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--text-muted);
    cursor: pointer;
    width: auto !important;
    flex-shrink: 0;
    transition: border-color 0.15s, color 0.15s;
  }

  .filter-select:hover {
    border-color: var(--accent);
    color: var(--text);
  }

  .filter-select:focus {
    border-color: var(--accent);
    color: var(--text);
    outline: none;
  }

  .staff-item mark {
    background: rgba(200, 169, 110, 0.3);
    color: var(--accent);
    border-radius: 2px;
    padding: 0 1px;
    font-style: normal;
  }

  .staff-no-results {
    padding: 16px;
    text-align: center;
    color: var(--text-dim);
    font-size: 12px;
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }

  /* NO PREVIEW STATE */
  .no-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--text-dim);
  }

  .no-preview-icon { font-size: 48px; opacity: 0.4; }
  .no-preview-text { font-size: 14px; }

  /* BADGE */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border-radius: 100px;
    font-size: 10px;
    font-weight: 600;
    font-family: 'DM Mono', monospace;
    background: rgba(200,169,110,0.15);
    color: var(--accent);
    letter-spacing: 0.5px;
  }

  /* Color picker style input */
  .color-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  input[type="color"] {
    width: 36px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface2);
    cursor: pointer;
    padding: 2px;
    flex-shrink: 0;
  }

  .font-select {
    flex: 1;
  }

  /* Tip */
  .tip {
    font-size: 11px;
    color: var(--text-dim);
    padding: 8px 10px;
    background: var(--surface2);
    border-radius: 6px;
    border-left: 2px solid var(--accent);
    line-height: 1.5;
  }
</style>
</head>
<body>

<header>
  <div class="logo">
    <span class="logo-title">WINNIE</span>
    <span class="logo-sub">Web-based Institutional Nursing Name-list Issuance of E-Certificates</span>
  </div>
  <div class="header-actions">
    <span id="headerCount" class="badge">0 selected</span>
    <div class="btn-divider"></div>
    <button class="btn btn-backup btn-sm" onclick="backupSet()" title="Save all settings + background + staff list as a ZIP">
      <span>⬇</span> Backup Dataset
    </button>
    <label class="btn btn-restore btn-sm" title="Restore from a previously saved backup ZIP">
      <span>⬆</span> Restore Dataset
      <input type="file" id="restoreFile" accept=".zip" onchange="restoreSet(event)" style="display:none">
    </label>
    <div class="btn-divider"></div>
    <button class="btn btn-ghost btn-sm" onclick="resetAll()">↺ Reset</button>
  </div>
</header>

<div class="layout">
  <!-- LEFT PANEL -->
  <div class="panel-left">

    <!-- SECTION: Background -->
    <div class="section">
      <div class="section-header" onclick="toggleSection('bg')">
        <span class="section-label"><span class="dot"></span> Background</span>
        <span class="section-toggle open" id="toggle-bg">▲</span>
      </div>
      <div class="section-body open" id="body-bg">
        <div class="upload-zone" id="bgDropZone">
          <input type="file" id="bgFile" accept="image/*" onchange="loadBackground(event)">
          <div class="upload-icon">🖼️</div>
          <div class="upload-text">Drop or click to upload certificate background</div>
          <div class="upload-hint">JPG, PNG — A4 ratio recommended (210×297mm)</div>
        </div>
        <div id="bgName" class="upload-hint" style="margin-top:8px; text-align:center;"></div>
      </div>
    </div>

    <!-- SECTION: Event Details -->
    <div class="section">
      <div class="section-header" onclick="toggleSection('event')">
        <span class="section-label"><span class="dot"></span> Event Details</span>
        <span class="section-toggle open" id="toggle-event">▲</span>
      </div>
      <div class="section-body open" id="body-event">
        <div class="field-row">
          <label>Event Title</label>
          <input type="text" id="eventTitle" value="CERTIFICATE OF ATTENDANCE" oninput="updatePreview()">
        </div>
        <div class="field-row">
          <label>Organizer</label>
          <input type="text" id="organizer" value="TRAINING UNIT" oninput="updatePreview()">
        </div>
        <div class="field-row">
          <label>Location</label>
          <input type="text" id="location" value="" oninput="updatePreview()">
        </div>
        <div class="row-2">
          <div class="field-row">
            <label>Date From</label>
            <input type="date" id="dateFrom" oninput="updatePreview()">
          </div>
          <div class="field-row">
            <label>Date To</label>
            <input type="date" id="dateTo" oninput="updatePreview()">
          </div>
        </div>
        <div class="row-2">
          <div class="field-row">
            <label>Serial Prefix</label>
            <input type="text" id="serialMain" value="CERT/2025/" oninput="updatePreview()">
          </div>
          <div class="field-row">
            <label>Starting #</label>
            <input type="number" id="serialStart" value="1" min="1" oninput="updatePreview()">
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION: Typography -->
    <div class="section">
      <div class="section-header" onclick="toggleSection('typo')">
        <span class="section-label"><span class="dot"></span> Typography</span>
        <span class="section-toggle" id="toggle-typo">▲</span>
      </div>
      <div class="section-body open" id="body-typo">
        <div class="field-row">
          <label>Text Color</label>
          <div class="color-row">
            <input type="color" id="textColor" value="#1a1a2e" onchange="updatePreview()">
            <input type="text" id="textColorHex" value="#1a1a2e" oninput="syncColor()" style="font-family:'DM Mono',monospace; flex:1">
          </div>
        </div>
        <div class="field-row">
          <label>Font Family</label>
          <select id="fontFamily" onchange="updatePreview()" class="font-select">
            <option value="helvetica">Helvetica</option>
            <option value="times">Times New Roman</option>
            <option value="courier">Courier</option>
          </select>
        </div>
        <p class="tip">💡 Adjust X (mm from left), Y (mm from top) and font size for each field below. A4 is 210mm wide × 297mm tall. X=105 is centered.</p>
      </div>
    </div>

    <!-- SECTION: Staff List -->
    <div class="section">
      <div class="section-header" onclick="toggleSection('staff')">
        <span class="section-label"><span class="dot"></span> Staff List</span>
        <span class="section-toggle open" id="toggle-staff">▲</span>
      </div>
      <div class="section-body open" id="body-staff">
        <div class="upload-zone" style="margin-bottom:12px">
          <input type="file" id="staffFile" accept=".txt,.csv" onchange="loadStaffFile(event)">
          <div class="upload-icon">📋</div>
          <div class="upload-text">Upload .txt or .csv file</div>
          <div class="upload-hint">CSV with headers: first column = Name, extra columns become certificate fields</div>
        </div>
        <div class="field-row">
          <label>Or type names manually (one per line)</label>
          <textarea id="staffTextarea" placeholder="JOHN DOE&#10;JANE SMITH&#10;AHMAD BIN ALI"></textarea>
        </div>
        <button class="btn btn-ghost btn-sm" style="width:100%; margin-bottom:10px" onclick="applyStaffList()">Apply List</button>

        <div id="csvColumnsInfo" style="display:none; margin-bottom:10px;">
          <p class="tip">📊 CSV columns detected — extra fields added to Field Positions below.</p>
        </div>

        <div class="btn-group" style="margin-bottom:8px">
          <button class="btn btn-ghost btn-sm" onclick="selectAll()">Select All</button>
          <button class="btn btn-ghost btn-sm" onclick="selectNone()">None</button>
          <button class="btn btn-ghost btn-sm" onclick="invertSelection()">Invert</button>
          <select id="staffFilter" class="filter-select" onchange="filterStaffList()" title="Filter list view">
            <option value="all">All</option>
            <option value="checked">✓ Checked</option>
            <option value="unchecked">✗ Unchecked</option>
          </select>
        </div>

        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="staffSearch" placeholder="Search names…" oninput="filterStaffList()" autocomplete="off">
          <button class="search-clear" id="searchClear" onclick="clearSearch()" title="Clear search">✕</button>
        </div>

        <div class="staff-list-container" id="staffList"></div>
        <div class="staff-count" id="staffCount">0 people, 0 selected</div>
      </div>
    </div>

    <!-- SECTION: Field Positions -->
    <div class="section">
      <div class="section-header" onclick="toggleSection('fields')">
        <span class="section-label"><span class="dot"></span> Field Positions</span>
        <span class="section-toggle open" id="toggle-fields">▲</span>
      </div>
      <div class="section-body open" id="body-fields">
        <div id="fieldControls"></div>
      </div>
    </div>

  </div>

  <!-- RIGHT PANEL -->
  <div class="panel-right">
    <div class="preview-header">
      <span class="preview-label">Live Preview</span>
      <div class="preview-nav">
        <button class="btn btn-ghost btn-sm" onclick="prevPerson()">◀</button>
        <span id="previewPersonLabel">—</span>
        <button class="btn btn-ghost btn-sm" onclick="nextPerson()">▶</button>
      </div>
    </div>
    <div class="preview-wrap" id="previewWrap">
      <div class="no-preview">
        <div class="no-preview-icon">🏅</div>
        <div class="no-preview-text">Configure fields to see a live preview</div>
      </div>
    </div>
    <div class="generate-bar">
      <label class="checkbox-wrap">
        <input type="checkbox" id="zipAll" checked>
        Bundle as ZIP
      </label>
      <div style="flex:1"></div>
      <button class="btn btn-success btn-lg" onclick="generateAll()">
        ⬇ Generate Certificates
      </button>
    </div>
  </div>
</div>

<!-- PROGRESS OVERLAY -->
<div class="progress-overlay" id="progressOverlay">
  <div class="progress-card">
    <div class="progress-title">Generating…</div>
    <div class="progress-sub" id="progressSub">Preparing certificates</div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" id="progressFill"></div>
    </div>
    <div class="progress-stats" id="progressStats">0 / 0</div>
  </div>
</div>

<!-- TOAST -->
<div class="toast-container" id="toastContainer"></div>


<script>
// ─── STATE ───────────────────────────────────────────────────────────────────
let bgImage = null;
let staffNames = [];
let staffSelected = [];
let staffCustomData = {}; // { "PERSON NAME": { "col_header": "value", ... } }
let previewPersonIndex = 0;
let previewCanvas = null;

const BASE_FIELDS = [
  { id: 'name',       label: 'Staff Name',    xMm: 105, yMm: 123, fontSize: 20, visible: true,  bold: true,  isCustom: false },
  { id: 'title',      label: 'Event Title',   xMm: 105, yMm: 150, fontSize: 14, visible: true,  bold: false, isCustom: false },
  { id: 'date',       label: 'Date',          xMm: 105, yMm: 178, fontSize: 13, visible: true,  bold: false, isCustom: false },
  { id: 'organizer',  label: 'Organizer',     xMm: 105, yMm: 201, fontSize: 12, visible: true,  bold: false, isCustom: false },
  { id: 'location',   label: 'Location',      xMm: 105, yMm: 225, fontSize: 12, visible: false, bold: false, isCustom: false },
  { id: 'serial',     label: 'Serial Number', xMm: 105, yMm: 278, fontSize: 8,  visible: true,  bold: false, isCustom: false },
];

let FIELDS = [...BASE_FIELDS];

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateFrom').value = today;
  renderFieldControls();
  renderStaffList();
  setupDragDrop();
  autoLoadDefaultBackground();
  autoLoadNamelist();
});

function autoLoadDefaultBackground() {
  const img = new Image();
  img.onload = () => {
    // Draw onto canvas to get a base64 data URL usable by jsPDF
    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    bgImage = canvas.toDataURL('image/jpeg');
    document.getElementById('bgName').textContent = '✓ default_background.jpg (auto-loaded)';
    updatePreview();
    toast('Default background auto-loaded', 'success');
  };
  img.onerror = () => {
    // File not present — generate a white + gold border fallback
    generateFallbackBackground();
    updatePreview();
  };
  img.src = 'default_background.jpg';
}

function generateFallbackBackground() {
  const W = 794, H = 1123; // A4 at ~96dpi
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Outer gold border
  ctx.strokeStyle = '#c8a96e';
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Inner thin gold border
  ctx.strokeStyle = '#c8a96e';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Innermost hairline
  ctx.strokeStyle = '#e8d49a';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  // Corner ornaments — small filled squares at each corner
  const corners = [
    [18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]
  ];
  ctx.fillStyle = '#c8a96e';
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Mid-border dots on each side
  const mids = [
    [W / 2, 18], [W / 2, H - 18],
    [18, H / 2], [W - 18, H / 2]
  ];
  ctx.fillStyle = '#c8a96e';
  mids.forEach(([mx, my]) => {
    ctx.beginPath();
    ctx.arc(mx, my, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  bgImage = canvas.toDataURL('image/jpeg', 1.0);
  document.getElementById('bgName').textContent = '✦ Default background (auto-generated)';
}

function autoLoadNamelist() {
  fetch('namelist.txt')
    .then(res => {
      if (!res.ok) throw new Error('not found');
      return res.text();
    })
    .then(text => {
      const clean = text.replace(/^\uFEFF/, ''); // strip BOM
      document.getElementById('staffTextarea').value = clean;
      applyStaffList();
      toast('namelist.txt auto-loaded', 'success');
    })
    .catch(() => {
      // File not present — silently continue
    });
}

// ─── SECTION TOGGLE ──────────────────────────────────────────────────────────
function toggleSection(id) {
  const body = document.getElementById('body-' + id);
  const toggle = document.getElementById('toggle-' + id);
  const open = body.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.textContent = open ? '▲' : '▼';
}

// ─── BACKGROUND ──────────────────────────────────────────────────────────────
function loadBackground(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    bgImage = e.target.result;
    document.getElementById('bgName').textContent = '✓ ' + file.name;
    updatePreview();
    toast('Background loaded: ' + file.name, 'success');
  };
  reader.readAsDataURL(file);
}

// ─── STAFF LIST ───────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

function detectCSVWithHeaders(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return null;

  const firstRow = parseCSVLine(lines[0]);
  // Needs at least 2 columns to be considered a multi-column CSV
  if (firstRow.length < 2) return null;

  // Check that the first row looks like headers (not all-caps names)
  // Heuristic: if second+ columns exist, treat first row as headers
  const headers = firstRow.map(h => h.trim());
  const dataRows = lines.slice(1).map(l => parseCSVLine(l)).filter(r => r[0]?.trim());
  return { headers, dataRows };
}

function loadStaffFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    let text = e.target.result.replace(/^\uFEFF/, '');
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const csvData = isCSV ? detectCSVWithHeaders(text) : null;

    if (csvData && csvData.headers.length >= 2) {
      // Multi-column CSV detected
      applyCSVData(csvData);
      toast(`CSV loaded: ${csvData.dataRows.length} rows, ${csvData.headers.length} columns`, 'success');
    } else {
      // Plain text / single-column — standard behaviour
      document.getElementById('staffTextarea').value = text;
      clearCustomFields();
      applyStaffList();
      toast('Staff list loaded: ' + file.name, 'success');
    }
  };
  reader.readAsText(file);
}

function clearCustomFields() {
  staffCustomData = {};
  FIELDS = [...BASE_FIELDS];
  document.getElementById('csvColumnsInfo').style.display = 'none';
  renderFieldControls();
}

function applyCSVData(csvData) {
  const { headers, dataRows } = csvData;
  const nameColIndex = 0; // First column is always Name

  // Reset custom fields — keep only BASE_FIELDS
  FIELDS = BASE_FIELDS.map(f => ({ ...f }));

  // Create custom fields from extra columns
  const lastBaseY = Math.max(...BASE_FIELDS.filter(f => f.id !== 'serial').map(f => f.yMm));
  const serialField = BASE_FIELDS.find(f => f.id === 'serial');
  const customStartY = lastBaseY + 20;

  for (let c = 1; c < headers.length; c++) {
    const colName = headers[c].trim();
    if (!colName) continue;
    const fieldId = 'csv_' + colName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const yPos = customStartY + (c - 1) * 18;

    // Insert before serial (if serial exists), otherwise append
    const serialIdx = FIELDS.findIndex(f => f.id === 'serial');
    const newField = {
      id:       fieldId,
      label:    colName,
      xMm:      105,
      yMm:      yPos > 270 ? 250 : yPos,
      fontSize: 12,
      visible:  true,
      bold:     false,
      isCustom: true,
      csvCol:   c,
      csvHeader: colName,
    };

    if (serialIdx >= 0) {
      FIELDS.splice(serialIdx, 0, newField);
    } else {
      FIELDS.push(newField);
    }
  }

  // Build staff data
  staffCustomData = {};
  const names = [];
  dataRows.forEach(row => {
    const name = (row[nameColIndex] || '').trim().toUpperCase();
    if (!name) return;
    names.push(name);

    const personData = {};
    for (let c = 1; c < headers.length; c++) {
      const colName = headers[c].trim();
      if (!colName) continue;
      personData[colName] = (row[c] || '').trim();
    }
    staffCustomData[name] = personData;
  });

  staffNames = [...new Set(names)];
  staffSelected = staffNames.map(() => true);
  previewPersonIndex = 0;

  // Update textarea with names only (for display)
  document.getElementById('staffTextarea').value = staffNames.join('\n');

  // Show CSV info banner
  const extraCols = headers.slice(1).filter(h => h.trim());
  document.getElementById('csvColumnsInfo').style.display = 'block';

  renderFieldControls();
  renderStaffList();
  updatePreview();
  updateHeaderCount();
}

function applyStaffList() {
  const raw = document.getElementById('staffTextarea').value;
  let names = [];
  raw.split('\n').forEach(line => {
    line.split(',').forEach(n => {
      const t = n.trim().toUpperCase();
      if (t) names.push(t);
    });
  });
  staffNames = [...new Set(names)];
  staffSelected = staffNames.map(() => true);
  previewPersonIndex = 0;
  renderStaffList();
  updatePreview();
  updateHeaderCount();
}

function renderStaffList() {
  filterStaffList();
}

function toggleStaff(i) {
  staffSelected[i] = !staffSelected[i];
  if (previewPersonIndex === i) updatePreview();
  filterStaffList();
}

function selectAll()       { staffSelected = staffNames.map(() => true);  filterStaffList(); updatePreview(); }
function selectNone()      { staffSelected = staffNames.map(() => false); filterStaffList(); updatePreview(); }
function invertSelection() { staffSelected = staffSelected.map(v => !v);  filterStaffList(); updatePreview(); }

function filterStaffList() {
  const query     = (document.getElementById('staffSearch')?.value || '').trim().toUpperCase();
  const filterVal = document.getElementById('staffFilter')?.value || 'all';
  const clearBtn  = document.getElementById('searchClear');
  if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);

  const container = document.getElementById('staffList');
  if (!staffNames.length) {
    container.innerHTML = '<div class="staff-no-results">No staff loaded</div>';
    document.getElementById('staffCount').textContent = '0 people, 0 selected';
    updateHeaderCount();
    return;
  }

  const filtered = staffNames
    .map((name, i) => ({ name, i }))
    .filter(({ name, i }) => {
      const matchesSearch = !query || name.includes(query);
      const matchesFilter =
        filterVal === 'all'       ? true :
        filterVal === 'checked'   ? staffSelected[i] :
        filterVal === 'unchecked' ? !staffSelected[i] : true;
      return matchesSearch && matchesFilter;
    });

  if (!filtered.length) {
    const reason = query ? `"<strong>${query}</strong>"` : filterVal === 'checked' ? 'checked names' : 'unchecked names';
    container.innerHTML = `<div class="staff-no-results">No results for ${reason}</div>`;
  } else {
    container.innerHTML = filtered.map(({ name, i }) => {
      const display = query
        ? name.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>')
        : name;
      return `
        <div class="staff-item ${staffSelected[i] ? 'selected' : ''}" onclick="toggleStaff(${i})">
          <input type="checkbox" ${staffSelected[i] ? 'checked' : ''} onclick="event.stopPropagation(); toggleStaff(${i})">
          <span class="staff-num">${String(i + 1).padStart(2, '0')}</span>
          <span>${display}</span>
        </div>`;
    }).join('');
  }

  const sel = staffSelected.filter(Boolean).length;
  const matchLabel = (query || filterVal !== 'all') ? ` (${filtered.length} shown)` : '';
  document.getElementById('staffCount').textContent = `${staffNames.length} people, ${sel} selected${matchLabel}`;
  updateHeaderCount();
}

function clearSearch() {
  document.getElementById('staffSearch').value = '';
  filterStaffList();
  document.getElementById('staffSearch').focus();
}

function updateHeaderCount() {
  const sel = staffSelected.filter(Boolean).length;
  document.getElementById('headerCount').textContent = sel + ' selected';
}

// ─── FIELD CONTROLS ───────────────────────────────────────────────────────────
function renderFieldControls() {
  const container = document.getElementById('fieldControls');
  let hasCustom = false;
  container.innerHTML = FIELDS.map((f, i) => {
    let separator = '';
    if (f.isCustom && !hasCustom) {
      hasCustom = true;
      separator = `<div style="padding:6px 0 4px; font-size:10px; letter-spacing:1px; text-transform:uppercase; color:var(--accent); font-weight:600; border-top:1px dashed var(--border); margin-top:6px;">📊 CSV Custom Fields</div>`;
    }
    return `${separator}
    <div class="field-control" ${f.isCustom ? 'style="border-color:rgba(200,169,110,0.25);"' : ''}>
      <input type="checkbox" id="fvis-${f.id}" ${f.visible ? 'checked' : ''} onchange="updateField(${i},'visible',this.checked)">
      <span class="field-name">${f.label}${f.isCustom ? ' <span style="font-size:9px;color:var(--text-dim)">(CSV)</span>' : ''}</span>
      <div>
        <div class="field-inputs">
          <div>
            <input type="number" class="field-mini" id="fx-${f.id}" value="${f.xMm}" min="0" max="210" step="1" oninput="updateField(${i},'xMm',parseFloat(this.value))">
            <div class="field-mini-label">X mm</div>
          </div>
          <div>
            <input type="number" class="field-mini" id="fy-${f.id}" value="${f.yMm}" min="1" max="290" step="1" oninput="updateField(${i},'yMm',parseFloat(this.value))">
            <div class="field-mini-label">Y mm</div>
          </div>
          <div>
            <input type="number" class="field-mini" id="fsize-${f.id}" value="${f.fontSize}" min="6" max="48" step="1" oninput="updateField(${i},'fontSize',parseFloat(this.value))">
            <div class="field-mini-label">pt</div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateField(i, key, val) {
  FIELDS[i][key] = val;
  updatePreview();
}

// ─── COLOR SYNC ───────────────────────────────────────────────────────────────
function syncColor() {
  const hex = document.getElementById('textColorHex').value;
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    document.getElementById('textColor').value = hex;
    updatePreview();
  }
}

document.addEventListener('change', e => {
  if (e.target.id === 'textColor') {
    document.getElementById('textColorHex').value = e.target.value;
    updatePreview();
  }
});

// ─── DATE FORMATTING ──────────────────────────────────────────────────────────
function formatDateRange() {
  const fromVal = document.getElementById('dateFrom').value;
  const toVal   = document.getElementById('dateTo').value;
  if (!fromVal) return '';
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const from = new Date(fromVal + 'T00:00:00');
  if (!toVal) return `${from.getDate()} ${months[from.getMonth()]} ${from.getFullYear()}`;
  const to = new Date(toVal + 'T00:00:00');
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    return `${from.getDate()} – ${to.getDate()} ${months[to.getMonth()]} ${to.getFullYear()}`;
  }
  return `${from.getDate()} ${months[from.getMonth()]} – ${to.getDate()} ${months[to.getMonth()]} ${to.getFullYear()}`;
}

// ─── PREVIEW ─────────────────────────────────────────────────────────────────
function prevPerson() {
  if (!staffNames.length) return;
  previewPersonIndex = (previewPersonIndex - 1 + staffNames.length) % staffNames.length;
  updatePreview();
}
function nextPerson() {
  if (!staffNames.length) return;
  previewPersonIndex = (previewPersonIndex + 1) % staffNames.length;
  updatePreview();
}

function updatePreview() {
  const wrap = document.getElementById('previewWrap');
  const personName = staffNames[previewPersonIndex] || 'SAMPLE NAME';
  const labelEl = document.getElementById('previewPersonLabel');

  if (staffNames.length > 0) {
    labelEl.textContent = `${previewPersonIndex + 1} / ${staffNames.length}`;
  } else {
    labelEl.textContent = 'Preview';
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'previewCanvas';
  const A4_W = 794, A4_H = 1123; // ~96dpi A4
  canvas.width = A4_W;
  canvas.height = A4_H;
  const ctx = canvas.getContext('2d');

  const serialNum = getSerial(previewPersonIndex);
  const dateStr   = formatDateRange();
  const textColor = document.getElementById('textColor').value || '#1a1a2e';
  const fontFam   = document.getElementById('fontFamily').value || 'helvetica';

  const draw = () => {
    ctx.clearRect(0, 0, A4_W, A4_H);

    if (bgImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, A4_W, A4_H);
        drawFields(ctx, personName, serialNum, dateStr, textColor, A4_W, A4_H);
        finishPreview(canvas, wrap);
      };
      img.src = bgImage;
    } else {
      ctx.fillStyle = '#f5f0e8';
      ctx.fillRect(0, 0, A4_W, A4_H);
      // Decorative border
      ctx.strokeStyle = '#c8a96e';
      ctx.lineWidth = 6;
      ctx.strokeRect(24, 24, A4_W - 48, A4_H - 48);
      ctx.strokeStyle = '#d9ba80';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(34, 34, A4_W - 68, A4_H - 68);
      drawFields(ctx, personName, serialNum, dateStr, textColor, A4_W, A4_H);
      finishPreview(canvas, wrap);
    }
  };
  draw();
}

function finishPreview(canvas, wrap) {
  wrap.innerHTML = '';
  canvas.style.maxHeight = '70vh';
  canvas.style.width = 'auto';
  wrap.appendChild(canvas);
}

function drawFields(ctx, personName, serialNum, dateStr, textColor, W, H) {
  const mmToY = mm => (mm / 297) * H;
  const mmToX = mm => (mm / 210) * W;
  ctx.textAlign = 'center';

  const fontFam = document.getElementById('fontFamily').value || 'sans-serif';
  const canvasFontMap = { helvetica: 'Arial, sans-serif', times: 'Georgia, serif', courier: '"Courier New", monospace' };
  const canvasFontFam = canvasFontMap[fontFam] || 'Arial, sans-serif';

  ctx.fillStyle = textColor;

  const baseVals = {
    name:      personName,
    title:     document.getElementById('eventTitle').value,
    date:      dateStr,
    organizer: document.getElementById('organizer').value,
    location:  document.getElementById('location').value,
    serial:    serialNum,
  };

  // Merge custom field values from CSV data
  const customData = staffCustomData[personName] || {};

  FIELDS.forEach(f => {
    if (!f.visible) return;
    let v;
    if (f.isCustom) {
      v = customData[f.csvHeader] || '';
    } else {
      v = baseVals[f.id];
    }
    if (!v) return;
    const ptToPx = f.fontSize * (H / 297 / 3.779528);
    ctx.font = `${f.bold ? 'bold ' : ''}${ptToPx}px ${canvasFontFam}`;
    ctx.fillText(v, mmToX(f.xMm), mmToY(f.yMm));
  });
}

// ─── SERIAL ───────────────────────────────────────────────────────────────────
function getSerial(i) {
  const prefix = document.getElementById('serialMain').value;
  const start  = parseInt(document.getElementById('serialStart').value) || 1;
  return prefix + String(start + i).padStart(3, '0');
}

// ─── PDF GENERATION ───────────────────────────────────────────────────────────
async function generateAll() {
  const selected = staffNames.filter((_, i) => staffSelected[i]);
  if (!selected.length) { toast('No staff selected!', 'error'); return; }

  const doZip   = document.getElementById('zipAll').checked;
  const overlay = document.getElementById('progressOverlay');
  const fill    = document.getElementById('progressFill');
  const sub     = document.getElementById('progressSub');
  const stats   = document.getElementById('progressStats');

  overlay.classList.add('show');
  const zip = doZip ? new JSZip() : null;
  const { jsPDF } = window.jspdf;

  for (let idx = 0; idx < selected.length; idx++) {
    const name = selected[idx];
    const globalIdx = staffNames.indexOf(name);
    const pct = ((idx + 1) / selected.length) * 100;
    fill.style.width = pct + '%';
    sub.textContent = name;
    stats.textContent = `${idx + 1} / ${selected.length}`;
    await new Promise(r => setTimeout(r, 0));

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textColor = document.getElementById('textColor').value || '#1a1a2e';
    const r = parseInt(textColor.slice(1,3),16);
    const g = parseInt(textColor.slice(3,5),16);
    const b = parseInt(textColor.slice(5,7),16);
    const fontFam = document.getElementById('fontFamily').value || 'helvetica';
    const dateStr  = formatDateRange();
    const serialNum = getSerial(globalIdx >= 0 ? globalIdx : idx);

    if (bgImage) {
      const ext = bgImage.includes('image/png') ? 'PNG' : 'JPEG';
      pdf.addImage(bgImage, ext, 0, 0, 210, 297);
    }

    pdf.setTextColor(r, g, b);
    pdf.setFont(fontFam);

    const vals = {
      name:      name,
      title:     document.getElementById('eventTitle').value,
      date:      dateStr,
      organizer: document.getElementById('organizer').value,
      location:  document.getElementById('location').value,
      serial:    serialNum,
    };

    // Merge custom field values from CSV data
    const customData = staffCustomData[name] || {};

    FIELDS.forEach(f => {
      if (!f.visible) return;
      let v;
      if (f.isCustom) {
        v = customData[f.csvHeader] || '';
      } else {
        v = vals[f.id];
      }
      if (!v) return;
      pdf.setFontSize(f.fontSize);
      pdf.setFont(fontFam, f.bold ? 'bold' : 'normal');
      pdf.text(v, f.xMm, f.yMm, { align: 'center' });
    });

    const title = (document.getElementById('eventTitle').value || 'CERT').replace(/\s+/g,'_');
    const safeName = name.replace(/\s+/g,'_');
    const fileName = `${title}-${safeName}.pdf`;

    if (doZip) {
      zip.file(fileName, pdf.output('arraybuffer'));
    } else {
      pdf.save(fileName);
      await new Promise(r => setTimeout(r, 80));
    }
  }

  if (doZip) {
    const blob = await zip.generateAsync({ type: 'blob' });
    const zipName = (document.getElementById('eventTitle').value || 'CERTS').replace(/\s+/g,'_')
      + '-' + (document.getElementById('dateFrom').value || 'batch') + '.zip';
    saveAs(blob, zipName);
  }

  overlay.classList.remove('show');
  toast(`✓ ${selected.length} certificate${selected.length > 1 ? 's' : ''} generated!`, 'success');
}

// ─── DRAG & DROP ──────────────────────────────────────────────────────────────
function setupDragDrop() {
  const zone = document.getElementById('bgDropZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        bgImage = ev.target.result;
        document.getElementById('bgName').textContent = '✓ ' + f.name;
        updatePreview();
        toast('Background loaded: ' + f.name, 'success');
      };
      reader.readAsDataURL(f);
    }
  });
}

// ─── RESET ────────────────────────────────────────────────────────────────────
function resetAll() {
  if (!confirm('Reset everything?')) return;
  bgImage = null;
  staffNames = [];
  staffSelected = [];
  staffCustomData = {};
  previewPersonIndex = 0;
  FIELDS = BASE_FIELDS.map(f => ({ ...f }));
  document.getElementById('bgName').textContent = '';
  document.getElementById('bgFile').value = '';
  document.getElementById('staffTextarea').value = '';
  document.getElementById('staffFile').value = '';
  document.getElementById('eventTitle').value = 'CERTIFICATE OF ATTENDANCE';
  document.getElementById('organizer').value = 'TRAINING UNIT';
  document.getElementById('location').value = '';
  document.getElementById('serialMain').value = 'CERT/2025/';
  document.getElementById('serialStart').value = '1';
  document.getElementById('csvColumnsInfo').style.display = 'none';
  renderFieldControls();
  renderStaffList();
  updatePreview();
  toast('Reset complete', 'success');
}

// ─── BACKUP SET ───────────────────────────────────────────────────────────────
async function backupSet() {
  const zip = new JSZip();

  // Collect current field state from DOM (in case user edited without triggering updateField)
  const fieldSnapshot = FIELDS.map(f => ({
    id:       f.id,
    label:    f.label,
    xMm:      parseFloat(document.getElementById(`fx-${f.id}`)?.value ?? f.xMm),
    yMm:      parseFloat(document.getElementById(`fy-${f.id}`)?.value ?? f.yMm),
    fontSize: parseFloat(document.getElementById(`fsize-${f.id}`)?.value ?? f.fontSize),
    visible:  document.getElementById(`fvis-${f.id}`)?.checked ?? f.visible,
    bold:     f.bold,
    isCustom: f.isCustom || false,
    csvCol:   f.csvCol ?? null,
    csvHeader: f.csvHeader ?? null,
  }));

  const data = {
    version: 2,
    savedAt: new Date().toISOString(),
    event: {
      title:       document.getElementById('eventTitle').value,
      organizer:   document.getElementById('organizer').value,
      location:    document.getElementById('location').value,
      dateFrom:    document.getElementById('dateFrom').value,
      dateTo:      document.getElementById('dateTo').value,
      serialMain:  document.getElementById('serialMain').value,
      serialStart: document.getElementById('serialStart').value,
    },
    typography: {
      textColor:  document.getElementById('textColor').value,
      fontFamily: document.getElementById('fontFamily').value,
    },
    fields: fieldSnapshot,
    staff: {
      names:      staffNames,
      selected:   staffSelected,
      textarea:   document.getElementById('staffTextarea').value,
      customData: staffCustomData,
    },
    background: {
      filename: document.getElementById('bgName').textContent.replace(/^✓\s*/, '') || null,
      included: !!bgImage,
    },
  };

  zip.file('certforge-data.json', JSON.stringify(data, null, 2));

  if (bgImage) {
    // bgImage is a base64 data URL — extract the raw base64 bytes
    const [header, b64] = bgImage.split(',');
    const ext = header.includes('png') ? 'png' : 'jpg';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    zip.file(`background.${ext}`, bytes);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const title = (data.event.title || 'certforge').replace(/\s+/g, '_');
  const date  = data.event.dateFrom || new Date().toISOString().slice(0,10);
  saveAs(blob, `${title}-backup-${date}.zip`);
  toast('Backup saved!', 'success');
}

// ─── RESTORE SET ──────────────────────────────────────────────────────────────
async function restoreSet(event) {
  const file = event.target.files[0];
  if (!file) return;
  // Reset input so same file can be re-loaded later
  event.target.value = '';

  try {
    const zip = await JSZip.loadAsync(file);

    // --- Load JSON data ---
    const jsonFile = zip.file('certforge-data.json');
    if (!jsonFile) { toast('Invalid backup: missing certforge-data.json', 'error'); return; }
    const raw  = await jsonFile.async('string');
    const data = JSON.parse(raw);

    // Restore event details
    if (data.event) {
      document.getElementById('eventTitle').value  = data.event.title       ?? '';
      document.getElementById('organizer').value   = data.event.organizer   ?? '';
      document.getElementById('location').value    = data.event.location    ?? '';
      document.getElementById('dateFrom').value    = data.event.dateFrom    ?? '';
      document.getElementById('dateTo').value      = data.event.dateTo      ?? '';
      document.getElementById('serialMain').value  = data.event.serialMain  ?? '';
      document.getElementById('serialStart').value = data.event.serialStart ?? '1';
    }

    // Restore typography
    if (data.typography) {
      const col = data.typography.textColor || '#1a1a2e';
      document.getElementById('textColor').value    = col;
      document.getElementById('textColorHex').value = col;
      const fontSel = document.getElementById('fontFamily');
      if (data.typography.fontFamily) fontSel.value = data.typography.fontFamily;
    }

    // Restore field positions
    if (data.fields && Array.isArray(data.fields)) {
      // Rebuild FIELDS from scratch to include custom fields from backup
      FIELDS = data.fields.map(saved => {
        const base = BASE_FIELDS.find(f => f.id === saved.id);
        return {
          id:        saved.id,
          label:     saved.label,
          xMm:       saved.xMm ?? (base ? base.xMm : 105),
          yMm:       saved.yMm,
          fontSize:  saved.fontSize,
          visible:   saved.visible,
          bold:      saved.bold ?? (base ? base.bold : false),
          isCustom:  saved.isCustom || false,
          csvCol:    saved.csvCol ?? null,
          csvHeader: saved.csvHeader ?? null,
        };
      });
      renderFieldControls();
    }

    // Restore staff list
    if (data.staff) {
      staffNames      = data.staff.names    || [];
      staffSelected   = data.staff.selected || staffNames.map(() => true);
      staffCustomData = data.staff.customData || {};
      const ta = data.staff.textarea || staffNames.join('\n');
      document.getElementById('staffTextarea').value = ta;
      previewPersonIndex = 0;

      // Show CSV info if custom fields exist
      const hasCustom = FIELDS.some(f => f.isCustom);
      document.getElementById('csvColumnsInfo').style.display = hasCustom ? 'block' : 'none';

      renderStaffList();
      updateHeaderCount();
    }

    // --- Load background image ---
    bgImage = null;
    document.getElementById('bgName').textContent = '';
    const bgPng = zip.file('background.png');
    const bgJpg = zip.file('background.jpg') || zip.file('background.jpeg');
    const bgFile = bgPng || bgJpg;
    if (bgFile) {
      const b64   = await bgFile.async('base64');
      const mime  = bgPng ? 'image/png' : 'image/jpeg';
      bgImage     = `data:${mime};base64,${b64}`;
      const fname = bgPng ? 'background.png' : 'background.jpg';
      document.getElementById('bgName').textContent = '✓ ' + fname + ' (restored)';
    }

    updatePreview();
    toast('Set restored from backup!', 'success');
  } catch (err) {
    console.error(err);
    toast('Failed to restore backup: ' + err.message, 'error');
  }
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
</script>
</body>
</html>