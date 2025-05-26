# Autodesk XML Visualizer

## Overview
The Autodesk XML Visualizer is a web application that helps users inspect and visualize ARGB and RGBA color tokens from Autodesk XML files. The tool loads an XML file from disk and generates a table listing all color tokens in the order they appear, along with visual color swatches and compositing previews.

## Features
- Load Autodesk XML files directly from your local disk (no upload required).
- Instantly parses and displays all ARGB and RGBA color tokens as soon as a file is selected.
- Shows each token's name, format, value (with 3 decimal precision), hex code, alpha, and color swatches.
- Swatches include: raw RGB, and the color composited over white, gray, and black backgrounds (left half composited, right half pure background).
- Handles both single-line and multi-line XML tags.
- Clean, user-friendly interface with styled buttons.

## Project Structure
```
autodesk-xml-visualizer
├── src
│   ├── index.html       # Main HTML document
│   ├── style.css        # Application styles
│   └── main.js          # JavaScript for parsing and rendering
├── package.json         # (Optional) npm configuration file
└── README.md            # Project documentation
```

## Getting Started

### Prerequisites
- A modern web browser (no server or Node.js required).

### Usage
1. Open `src/index.html` in your web browser.
2. Click the **Choose XML File** button and select an Autodesk XML file from your disk.
3. The application will automatically parse the file and display a table of all ARGB and RGBA tokens, with color swatches and compositing previews.

## Table Columns
- **Name:** Tag name and attribute (e.g., `SelectEffectInfo : BaseColorRGBA`)
- **Format:** ARGB or RGBA
- **Value:** All four channel values, formatted to three decimals
- **Hex:** RGB hex code (no alpha)
- **Alpha:** Alpha value (0–1, three decimals)
- **RGB:** Swatch of the raw RGB color
- **RGB+A over white/gray/black:** Swatch with left half composited over the background, right half pure background

## XML Format
The tool is designed for Autodesk XML files containing ARGB and RGBA attributes. It works with both single-line and multi-line tags, and expects color values to be space- or comma-separated.

## Contributing
Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
