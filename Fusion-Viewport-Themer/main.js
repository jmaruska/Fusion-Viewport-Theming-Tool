document.addEventListener('DOMContentLoaded', function () {

    /* =========================
       1. Data & Palette Setup
       ========================= */
    // Color categories and their default values
    const categories = {
        Global: {
            Wireframe: "#000000",           // ModelEdgeColor, DMEdgePreviewColor
            Highlight: "#E3AD79",           // AdornerHighlightedColor, SketchConstraintHighlightedColor, AdornerSelectedAndHighlightedColor
            "Geometry Select": "#0696d7",   // ComponentSelectEffectInfo.LineColorRGBA, SelectEffectInfo.LineColorRGBA
            "Wireframe Select": "#00d5ff",  // AdornerSelectedColor, SketchConstraintSelectedColor
            Warning: "#faa21b",             // SketchCachedProjectedLineColor
            Error: "#ec4a41"                // SketchConflictingConstraintColor, JointErrorColor
        },
        "Sketch Workspace": {
            Profile: "#6ac0e7",             // SketchProfileColor
            Constrained: "#ffffff",         // SketchFullyConstrainedColor, SketchEntityColor
            Unconstrained: "#6ac0e7",       // SketchLineColor
            Fixed: "#9fdc66",               // SketchFixedLineColor
            Projected: "#b384f2",           // SketchProjectedLineColor
            Construction: "#db5942",        // SketchConstructionColor, TextBorderColor
            Dimensions: "#87b340",          // SketchDimensionColor, SketchDrivenDimensionColor, SketchDimensionInfoColor, JointDimensionColor
            Manipulators: "#86b340",        // SketchHandlePointColor, SketchInactiveHandleColor, SketchActiveHandleColor
        },
        "Dynamic Inspection": {
            Inference: "#84d7ce",           // InferenceDimensionColor, SketchInferenceColor, MeasureDimensionColor, DimensionPreviewColor, SketchInferenceMouseColor
            "Inspect": "#38abdf",           // MeasureDimensionHighlightColor
            "Preview": "#faa21b",           // DMBodyPreviewColor, DraftFacePreviewColor, SketchConstraintColor
        },
        "Work Features": {
            "Work Axis": "#00ffff",         // WorkAxisColor
            "Work Plane": "#fbb549"         // WorkPlaneColor
        },
        Joints: {
            "Joint Base": "#ffffff",        // JointBaseColor
            "Joint DOF": "#80cccc",        // JointDOFColor
            "Joint DOF2": "#ff9999",        // JointDOF2Color
            "Joint DOF3": "#99ff99"         // JointDOF3Color
        },

        Viewport: {
            "HUD Text": "#38abdf"           // DefaultMeasureTextColor
        }
    };

    // Helper to flatten categories for easy lookup and update
    function flattenCategories(obj) {
        let flat = {};
        for (const [group, cats] of Object.entries(obj)) {
            for (const [cat, color] of Object.entries(cats)) {
                flat[`${group}|||${cat}`] = { group, cat, color };
            }
        }
        return flat;
    }
    let flatCategories = flattenCategories(categories);

    /* =========================
       2. Dynamic UI Construction
       ========================= */
    const table = document.getElementById('category-table');
    let groupIndex = 0;
    for (const [group, cats] of Object.entries(categories)) {
        const details = document.createElement('details');
        if (groupIndex < 2) details.open = true; // Only first two open
        groupIndex++;

        // Summary with chevron
        const summary = document.createElement('summary');
        summary.innerHTML = `
  <svg class="hig-chevron" width="10" height="6" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <polyline points="1 1 5 5 9 1" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  ${group}
`;
        details.appendChild(summary);

        // Table of color categories
        const groupTable = document.createElement('table');
        for (const [cat, color] of Object.entries(cats)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td class="category">${cat}</td>
            <td><div class="color-box" id="${group}|||${cat}" style="background:${color}"></div></td>
        `;
            groupTable.appendChild(tr);
        }
        details.appendChild(groupTable);
        table.appendChild(details);
    }

    /* =========================
       3. Color Picker Logic
       ========================= */
    // Attach palette popover to each color box
    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function (e) {
            e.stopPropagation();
            const key = this.id;
            showPalettePopover(
                this,
                rgbToHex(this.style.background),
                function (val) {
                    flatCategories[key].color = val;
                    box.style.background = val;
                    categories[flatCategories[key].group][flatCategories[key].cat] = val;
                    document.getElementById('palette-popover').style.display = 'none';
                }
            );
        });
    });

    // Background color picker logic
    const bgColorPicker = document.getElementById('bg-color-picker');
    const bgVar = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#1a1f25';
    bgColorPicker.style.background = bgVar;
    updateSummaryTint(bgVar);
    updateBgStatusLine(bgVar);

    bgColorPicker.addEventListener('click', function (e) {
        e.stopPropagation();
        showPalettePopover(
            bgColorPicker,
            rgbToHex(bgColorPicker.style.background || getComputedStyle(document.documentElement).getPropertyValue('--bg')),
            function (val) {
                document.documentElement.style.setProperty('--bg', val);
                bgColorPicker.style.background = val;
                updateSummaryTint(val);
                updateBgStatusLine(val);
                document.getElementById('palette-popover').style.display = 'none';
            }
        );
    });

    /* =========================
       4. Palette Popover UI
       ========================= */
    function showPalettePopover(target, currentColor, onSelect) {
        const popover = document.getElementById('palette-popover');
        popover.innerHTML = ''; // Clear previous

        // Palette grid
        autodeskPalette.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'palette-row';
            row.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'palette-swatch';
                swatch.style.background = color;
                swatch.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof onSelect === 'function') onSelect(color);
                    popover.style.display = 'none';
                };
                rowDiv.appendChild(swatch);
            });
            popover.appendChild(rowDiv);
        });

        // Custom color input row
        const customRow = document.createElement('div');
        customRow.className = 'palette-custom-row';
        const customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.className = 'palette-custom-input';
        customInput.value = currentColor || '#ffffff';
        const customBtn = document.createElement('button');
        customBtn.className = 'palette-custom-btn';
        customBtn.textContent = 'Set Custom';
        customBtn.onclick = () => {
            let val = customInput.value.trim();
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                onSelect(val);
            } else {
                customInput.style.border = '1px solid #ec4a41';
            }
        };
        customInput.addEventListener('input', function () {
            customInput.style.border = '';
        });
        customInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') customBtn.click();
        });
        customRow.appendChild(customInput);
        customRow.appendChild(customBtn);
        popover.appendChild(customRow);

        // Focus input after DOM update
        setTimeout(() => { customInput.focus(); }, 0);

        // Position popover
        const rect = target.getBoundingClientRect();
        const popoverWidth = 320;
        let left = rect.right + window.scrollX;
        if (left + popoverWidth > window.innerWidth) {
            left = rect.left + window.scrollX - popoverWidth;
        }
        popover.style.left = left + 'px';
        popover.style.top = (rect.bottom + window.scrollY + 4) + 'px';
        popover.style.display = 'block';

        // Dismiss on outside click
        setTimeout(() => {
            document.addEventListener('mousedown', hidePaletteOnClick, { once: true });
        }, 0);
    }

    function hidePaletteOnClick(e) {
        const popover = document.getElementById('palette-popover');
        if (!popover.contains(e.target)) {
            popover.style.display = 'none';
        }
    }

    /* =========================
       5. XML Generation
       ========================= */
    document.getElementById('generate-xml').onclick = function () {
        const updatedXml = generateXmlFromTemplate(xmlTemplate, categories);
        const win = window.open('', '_blank');
        const pre = win.document.createElement('pre');
        pre.style.fontFamily = 'monospace';
        pre.style.whiteSpace = 'pre-wrap';
        pre.textContent = updatedXml;
        win.document.body.appendChild(pre);
    };

    /* =========================
       6. Utility Functions
       ========================= */
    function rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        const nums = rgb.match(/\d+/g).map(Number);
        return "#" + nums.slice(0, 3).map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function decimalRgbToHex(str) {
        const parts = str.trim().split(/\s+/).map(Number);
        if (parts.length === 4) parts.shift();
        const rgb = parts.map(x => Math.round(x * 255));
        return (
            "#" +
            rgb.map(x => x.toString(16).padStart(2, "0")).join("").toLowerCase()
        );
    }

    function hexToRgbArray(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return [
            ((num >> 16) & 255) / 255,
            ((num >> 8) & 255) / 255,
            (num & 255) / 255
        ].map(v => Number(v.toFixed(3)));
    }

    function hexToRgbDecString(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        return [r, g, b].map(x => x.toFixed(3)).join(' ');
    }

    function replaceColorValue(orig, hex) {
        const rgb = hexToRgbArray(hex);
        const parts = orig.trim().split(/\s+/);
        if (parts.length === 4) {
            return [padColorValue(parts[0]), ...rgb.map(padColorValue)].join(' ');
        }
        return orig;
    }

    function padColorValue(val) {
        return Number(val).toFixed(3);
    }

    // Semantic mapping for XML generation
    const semanticToXml = {
        // === Global ===
        Wireframe: [
            { xml: 'ModelEdgeColor', attr: 'ARGB' },
            { xml: 'DMEdgePreviewColor', attr: 'ARGB' }
        ],
        Highlight: [
            { xml: 'AdornerHighlightedColor', attr: 'ARGB' },
            { xml: 'SketchConstraintHighlightedColor', attr: 'ARGB' },
            { xml: 'AdornerSelectedAndHighlightedColor', attr: 'ARGB' }
        ],
        "Geometry Select": [
            { xml: 'ComponentSelectEffectInfo', attr: 'LineColorRGBA' },
            { xml: 'SelectEffectInfo', attr: 'LineColorRGBA' }
        ],
        "Wireframe Select": [
            { xml: 'AdornerSelectedColor', attr: 'ARGB' },
            { xml: 'SketchConstraintSelectedColor', attr: 'ARGB' }
        ],
        Warning: [
            { xml: 'SketchCachedProjectedLineColor', attr: 'ARGB' },
        ],
        Error: [
            { xml: 'SketchConflictingConstraintColor', attr: 'ARGB' },
            { xml: 'JointErrorColor', attr: 'ARGB' }
        ],

        // === Sketch-Specific ===
        Profile: [
            { xml: 'SketchProfileColor', attr: 'ARGB' }
        ],
        Constrained: [
            { xml: 'SketchFullyConstrainedColor', attr: 'ARGB' },
            { xml: 'SketchEntityColor', attr: 'ARGB' }
        ],
        Unconstrained: [
            { xml: 'SketchLineColor', attr: 'ARGB' }
        ],
        Fixed: [
            { xml: 'SketchFixedLineColor', attr: 'ARGB' }
        ],
        Projected: [
            { xml: 'SketchProjectedLineColor', attr: 'ARGB' }
        ],
        Construction: [
            { xml: 'SketchConstructionColor', attr: 'ARGB' },
            { xml: 'TextBorderColor', attr: 'ARGB' }
        ],
        Dimensions: [
            { xml: 'SketchDimensionColor', attr: 'ARGB' },
            { xml: 'SketchDrivenDimensionColor', attr: 'ARGB' },
            { xml: 'SketchDimensionInfoColor', attr: 'ARGB' },
            { xml: 'JointDimensionColor', attr: 'ARGB' }
        ],
        Manipulators: [
            { xml: 'SketchHandlePointColor', attr: 'ARGB' },
            { xml: 'SketchInactiveHandleColor', attr: 'ARGB' },
            { xml: 'SketchActiveHandleColor', attr: 'ARGB' }
        ],

        // === Dynamic Inspection ===
        Inference: [
            { xml: 'InferenceDimensionColor', attr: 'ARGB' },
            { xml: 'SketchInferenceColor', attr: 'ARGB' },
            { xml: 'MeasureDimensionColor', attr: 'ARGB' },
            { xml: 'DimensionPreviewColor', attr: 'ARGB' },
            { xml: 'SketchInferenceMouseColor', attr: 'ARGB' }
        ],
        "Inspect": [
            { xml: 'MeasureDimensionHighlightColor', attr: 'ARGB' }
        ],
        "Preview": [
            { xml: 'DMBodyPreviewColor', attr: 'ARGB' },
            // { xml: 'TBCutPreviewColor', attr: 'ARGB' },
            { xml: 'DraftFacePreviewColor', attr: 'ARGB' },
            { xml: 'SketchConstraintColor', attr: 'ARGB' }
        ],

        // === Work Features ===
        "Work Axis": [
            { xml: 'WorkAxisColor', attr: 'ARGB' }
        ],
        "Work Plane": [
            { xml: 'WorkPlaneColor', attr: 'ARGB' }
        ],

        "Joint Base": [
            { xml: 'JointBaseColor', attr: 'ARGB' }
        ],
        "Joint DOF": [
            { xml: 'JointDOFColor', attr: 'ARGB' }
        ],
        "Joint DOF2": [
            { xml: 'JointDOF2Color', attr: 'ARGB' }
        ],
        "Joint DOF3": [
            { xml: 'JointDOF3Color', attr: 'ARGB' }
        ],

        // === Viewport ===
        "HUD Text": [
            { xml: 'DefaultMeasureTextColor', attr: 'ARGB' }
        ]
    };

    const xmlToSemantic = {};
    for (const [semantic, arr] of Object.entries(semanticToXml)) {
        arr.forEach(({ xml }) => {
            xmlToSemantic[xml] = semantic;
        });
    }

    function generateXmlFromTemplate(xmlTemplate, categories) {
        const lines = xmlTemplate.split('\n');
        let insideMultiLineTag = false;
        let currentTag = '';
        let blockSemanticMap = {};

        // Map for special multi-line blocks and their semantic assignments
        const blockSemanticAssignments = {
            SelectEffectInfo: {
                BaseColorRGBA: 'Geometry Select',
                BackFaceColorRGBA: 'Geometry Select',
                HaloColorRGBA: 'Wireframe Select',
                HiddenLineColorRGBA: 'Wireframe Select',
                LineColorRGBA: 'Wireframe Select',
                GlowColorRGBA: 'Wireframe Select'
            },

            ComponentSelectEffectInfo: {
                BaseColorRGBA: 'Geometry Select',
                BackFaceColorRGBA: 'Geometry Select',
                HaloColorRGBA: 'Wireframe Select',
                HiddenLineColorRGBA: 'Wireframe Select',
                LineColorRGBA: 'Wireframe',
                GlowColorRGBA: 'Wireframe Select'
            },

            HighlightEffectInfo: {
                BaseColorRGBA: 'Highlight',
                BackFaceColorRGBA: 'Highlight',
                HaloColorRGBA: 'Highlight',
                HiddenLineColorRGBA: 'Highlight',
                LineColorRGBA: 'Highlight',
                GlowColorRGBA: 'Highlight'
            },

            MaterialPreviewSelectEffectInfo: {
                BaseColorRGBA: 'Geometry Select',
                BackFaceColorRGBA: 'Geometry Select',
                HaloColorRGBA: 'Wireframe Select',
                HiddenLineColorRGBA: 'Wireframe Select',
                LineColorRGBA: 'Wireframe Select',
                GlowColorRGBA: 'Wireframe Select'
            },

            SketchSelectEffectInfo: {
                BaseColorRGBA: 'Geometry Select',
                BackFaceColorRGBA: 'Geometry Select',
                HaloColorRGBA: 'Wireframe Select',
                HiddenLineColorRGBA: 'Wireframe Select',
                LineColorRGBA: 'Wireframe Select',
                GlowColorRGBA: 'Wireframe Select'
            },

            ErrorHighlightEffectInfo: {
                BaseColorRGBA: 'Error',
                BackFaceColorRGBA: 'Error',
                HaloColorRGBA: 'Error',
                HiddenLineColorRGBA: 'Error',
                LineColorRGBA: 'Error',
                GlowColorRGBA: 'Error'
            },

            // PlaneSelectionManipulatorAxis: {
            //   XAxisColorARGB: 'Wireframe',
            //   YAxisColorARGB: 'Wireframe',
            //   ZAxisColorARGB: 'Wireframe'
            // },

            PlaneSelectionManipulatorPlane: {
                DefaultColorARGB: 'Wireframe',
                SelectColorARGB: 'Geometry Select',
                HighLightColorARGB: 'Highlight'
            }
            // Add more blocks as needed
        };

        // Helper for semantic lookup
        function findSemantic(tagName, attrName) {
            // Multi-line block attribute
            if (blockSemanticMap && blockSemanticMap[attrName]) return blockSemanticMap[attrName];
            // Single-line tag
            if (xmlToSemantic[tagName]) return xmlToSemantic[tagName];
            return null;
        }

        // Helper for hex lookup
        function findHex(semantic) {
            for (const group of Object.values(categories)) {
                if (group[semantic]) return group[semantic];
            }
            return null;
        }

        return lines.map(line => {
            // Detect start of a multi-line tag (including self-closing)
            const tagStart = line.match(/<(\w+)(\s|$)/);
            if (tagStart && !line.trim().endsWith('/>')) {
                insideMultiLineTag = true;
                currentTag = tagStart[1];
                blockSemanticMap = blockSemanticAssignments[currentTag] || {};
                return line;
            }

            // Detect end of a multi-line tag (self-closing)
            if (insideMultiLineTag && line.trim().endsWith('/>')) {
                insideMultiLineTag = false;
                currentTag = '';
                blockSemanticMap = {};
                return line;
            }

            // If inside a multi-line tag and the line is an attribute, update color if mapped (no comment)
            if (insideMultiLineTag) {
                const attrMatch = line.match(/^(\s*)(\w+Color(?:RGBA|ARGB)?)(\s*=\s*)"([^"]+)"/);
                if (attrMatch) {
                    const [, indent, attr, spacing, origValue] = attrMatch;
                    const semantic = findSemantic(currentTag, attr);
                    if (semantic) {
                        const hex = findHex(semantic);
                        if (hex) {
                            let newValue = origValue;
                            if (attr.endsWith('ARGB')) {
                                const parts = origValue.trim().split(/\s+/);
                                const alpha = parts[0];
                                const rgb = hexToRgbArray(hex);
                                newValue = [padColorValue(alpha), ...rgb.map(padColorValue)].join(' ');
                            } else if (attr.endsWith('RGBA')) {
                                const parts = origValue.trim().split(/\s+/);
                                const alpha = parts[3] || '1.0';
                                const rgb = hexToRgbArray(hex);
                                newValue = [...rgb.map(padColorValue), padColorValue(alpha)].join(' ');
                            }
                            return `${indent}${attr}${spacing}"${newValue}"`;
                        }
                    }
                }
                return line; // No change
            }

            // For any line containing ARGB, update color and add comment
            if (line.includes('ARGB')) {
                // Extract tag name and ARGB value
                const tagNameMatch = line.match(/<(\w+)/);
                const argbValueMatch = line.match(/ARGB\s*=\s*"([^"]+)"/);
                if (tagNameMatch && argbValueMatch) {
                    const tagName = tagNameMatch[1];
                    const origValue = argbValueMatch[1];
                    const semantic = findSemantic(tagName, 'ARGB');
                    let assigned = false;
                    let hex = null;
                    if (semantic) {
                        hex = findHex(semantic);
                        assigned = !!hex;
                    }
                    let newValue = origValue;
                    let comment;
                    if (assigned && hex) {
                        newValue = replaceColorValue(origValue, hex);
                        comment = `${hex} Semantic Class = ${semantic}`;
                    } else {
                        comment = `${decimalRgbToHex(origValue)} Unmodified from Template`;
                    }
                    let updatedLine = line.replace(origValue, newValue);
                    updatedLine = updatedLine.replace(/(\s*\/?>)$/, '$1'); // Ensure tag closes properly
                    updatedLine = updatedLine.replace(/<!--.*?-->/, '').trimEnd(); // Remove old trailing comment
                    updatedLine += ` <!-- ${comment} -->`;
                    return updatedLine;
                }
            }

            return line; // Non-color lines unchanged
        }).join('\n');
    }

    function isColorLight(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) > 186;
    }

    function blend(hex, percent, blendWith) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);

        let br = blendWith === "#fff" ? 255 : 0;
        let bg = blendWith === "#fff" ? 255 : 0;
        let bb = blendWith === "#fff" ? 255 : 0;

        r = Math.round(r + (br - r) * percent);
        g = Math.round(g + (bg - g) * percent);
        b = Math.round(b + (bb - b) * percent);

        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function updateSummaryTint(bgHex) {
        const light = isColorLight(bgHex);
        const summaryBg = blend(bgHex, 0.05, light ? "#000" : "#fff");
        document.documentElement.style.setProperty('--summary-bg', summaryBg);
        document.documentElement.style.setProperty('--text', light ? '#111' : '#f5f5f5');
    }

    function updateBgStatusLine(bgHex) {
        const rgbDec = hexToRgbDecString(bgHex);
        const status = document.getElementById('bg-status');
        status.innerHTML =
            `Current background color is: <b>${bgHex}</b>
Use this xml to change the background of your environment:</br>
  &lt;Background RGB="${rgbDec}"/&gt;
  &lt;RRTBackground RGB="${rgbDec}"/&gt;`;
    }

    // Initial update for summary and status line
    const initialBg = getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#1a1f25';
    updateSummaryTint(initialBg.trim());
    updateBgStatusLine(initialBg.trim());

});

/* ==========================
   Autodesk HIG Color Palette
   ========================== */

const autodeskPalette = [
    // [primary.black, primary.white]
    [
        "#000000", // primary.black
        "#ffffff"  // primary.white
    ],
    // primary.autodeskBlue.100 - .900
    [
        "#cdeaf7", // primary.autodeskBlue.100
        "#9bd5ef", // primary.autodeskBlue.200
        "#6ac0e7", // primary.autodeskBlue.300
        "#38abdf", // primary.autodeskBlue.400
        "#0696d7", // primary.autodeskBlue.500
        "#007fc6", // primary.autodeskBlue.600
        "#006eaf", // primary.autodeskBlue.700
        "#074b78", // primary.autodeskBlue.800
        "#0a324d"  // primary.autodeskBlue.900
    ],
    // primary.charcoal.100 - .900
    [
        "#eeeeee", // primary.charcoal.100
        "#dcdcdc", // primary.charcoal.200
        "#cccccc", // primary.charcoal.300
        "#bbbbbb", // primary.charcoal.400
        "#999999", // primary.charcoal.500
        "#808080", // primary.charcoal.600
        "#666666", // primary.charcoal.700
        "#4d4d4d", // primary.charcoal.800
        "#3c3c3c"  // primary.charcoal.900
    ],
    // secondary.darkBlue.100 - .900
    [
        "#e1ebf7", // secondary.darkBlue.100
        "#bcd3ee", // secondary.darkBlue.200
        "#8babdc", // secondary.darkBlue.300
        "#5f8bcb", // secondary.darkBlue.400
        "#3970b9", // secondary.darkBlue.500
        "#1858a8", // secondary.darkBlue.600
        "#064285", // secondary.darkBlue.700
        "#003163", // secondary.darkBlue.800
        "#0c2c54"  // secondary.darkBlue.900
    ],
    // secondary.green.100 - .900
    [
        "#e7f2d9", // secondary.green.100
        "#cfe4b3", // secondary.green.200
        "#b7d78c", // secondary.green.300
        "#9fc966", // secondary.green.400
        "#87b340", // secondary.green.500
        "#6a9728", // secondary.green.600
        "#507b16", // secondary.green.700
        "#385e08", // secondary.green.800
        "#234200"  // secondary.green.900
    ],
    // secondary.red.100 - .900
    [
        "#faeded", // secondary.red.100
        "#f7d6d6", // secondary.red.200
        "#f9b4b4", // secondary.red.300
        "#f48686", // secondary.red.400
        "#eb5555", // secondary.red.500
        "#dd2222", // secondary.red.600
        "#af1b1b", // secondary.red.700
        "#800f0f", // secondary.red.800
        "#520404"  // secondary.red.900
    ],
    // secondary.turquoise.100 - .900
    [
        "#d6f2ef", // secondary.turquoise.100
        "#ade4de", // secondary.turquoise.200
        "#84d7ce", // secondary.turquoise.300
        "#5bc9bd", // secondary.turquoise.400
        "#32bcad", // secondary.turquoise.500
        "#23a597", // secondary.turquoise.600
        "#168576", // secondary.turquoise.700
        "#0c665b", // secondary.turquoise.800
        "#04403d"  // secondary.turquoise.900
    ],
    // secondary.yellowOrange.100 - .900
    [
        "#feecd1", // secondary.yellowOrange.100
        "#fddaa4", // secondary.yellowOrange.200
        "#fcc776", // secondary.yellowOrange.300
        "#fbb549", // secondary.yellowOrange.400
        "#faa21b", // secondary.yellowOrange.500
        "#ed8d16", // secondary.yellowOrange.600
        "#d9730b", // secondary.yellowOrange.700
        "#bf5808", // secondary.yellowOrange.800
        "#8c3401"  // secondary.yellowOrange.900
    ],
    // tertiary.pink.100 - .900
    [
        "#ffebf5", // tertiary.pink.100
        "#ffd6eb", // tertiary.pink.200
        "#ffb8db", // tertiary.pink.300
        "#ff8cc6", // tertiary.pink.400
        "#fc56a9", // tertiary.pink.500
        "#e84396", // tertiary.pink.600
        "#c72877", // tertiary.pink.700
        "#991f5c", // tertiary.pink.800
        "#781848"  // tertiary.pink.900
    ],
    // tertiary.purple.100 - .900
    [
        "#f4edfd", // tertiary.purple.100
        "#eadcfd", // tertiary.purple.200
        "#d5bcf7", // tertiary.purple.300
        "#c5a1f8", // tertiary.purple.400
        "#b385f2", // tertiary.purple.500
        "#a76ef5", // tertiary.purple.600
        "#8558c5", // tertiary.purple.700
        "#5f3e8e", // tertiary.purple.800
        "#482f6b"  // tertiary.purple.900
    ],
    // tertiary.salmon.100 - .900
    [
        "#ffefec", // tertiary.salmon.100
        "#fcded9", // tertiary.salmon.200
        "#ffbeb3", // tertiary.salmon.300
        "#ff9582", // tertiary.salmon.400
        "#f26a52", // tertiary.salmon.500
        "#db5942", // tertiary.salmon.600
        "#a84a39", // tertiary.salmon.700
        "#853729", // tertiary.salmon.800
        "#66251a"  // tertiary.salmon.900
    ],
    // tertiary.slate.100 - .900
    [
        "#e9f0f7", // tertiary.slate.100
        "#dce7f3", // tertiary.slate.200
        "#c1cedc", // tertiary.slate.300
        "#a7bacf", // tertiary.slate.400
        "#7993b0", // tertiary.slate.500
        "#6784a6", // tertiary.slate.600
        "#4b6b8f", // tertiary.slate.700
        "#354d67", // tertiary.slate.800
        "#2c3e53"  // tertiary.slate.900
    ],
    // surface.lightGray.100 - .350
    [
        "#ffffff", // surface.lightGray.100
        "#f5f5f5", // surface.lightGray.200
        "#eeeeee", // surface.lightGray.250
        "#d9d9d9", // surface.lightGray.300
        "#cccccc"  // surface.lightGray.350
    ],
    // surface.darkBlue.100 - .350
    [
        "#454f61", // surface.darkBlue.100
        "#3b4453", // surface.darkBlue.200
        "#2e3440", // surface.darkBlue.250
        "#222933", // surface.darkBlue.300
        "#1a1f25"  // surface.darkBlue.350
    ],
    // surface.darkGray.100 - .350
    [
        "#535353", // surface.darkGray.100
        "#474747", // surface.darkGray.200
        "#373737", // surface.darkGray.250
        "#2a2a2a", // surface.darkGray.300
        "#202020"  // surface.darkGray.350
    ],
    // Success, Warning, Error
    [
        "#87b340", // success
        "#faa21b", // warning
        "#ec4a41"  // error
    ]
];



/* =============================
   XML Template (Static Content)
   ============================= */

const xmlTemplate = `
<!-- START GENERATED XML -->
  <OriginXAxisColor            ARGB = "1.000 1.000 0.000 0.000"/> <!-- OriginXAxisColor (red) -->
  <OriginYAxisColor            ARGB = "1.000 0.000 1.000 0.000"/> <!-- OriginYAxisColor (green) -->
  <OriginZAxisColor            ARGB = "1.000 0.000 0.000 1.000"/> <!-- OriginZAxisColor (blue) -->

  <!-- red, green, blue axis colors -->
  <PlaneSelectionManipulatorAxis
    thickness                  = "1.300"
    bounds                     = "0.175 2.250"
    XAxisColorARGB             = "1.000 1.000 0.000 0.000"
    YAxisColorARGB             = "1.000 0.000 1.000 0.000"
    ZAxisColorARGB             = "1.000 0.000 0.000 1.000"
 />

  <!-- colors of selected elements -->
  <SelectEffectInfo
    BaseColorRGBA              = "0.545 0.671 0.863 0.400"
    BackFaceColorRGBA          = "0.545 0.671 0.863 0.200"
    HaloColorRGBA              = "0.000 0.835 1.000 0.400"
    HiddenLineColorRGBA        = "0.000 0.835 1.000 0.200"
    LineColorRGBA              = "0.000 0.835 1.000 1.000"
    GlowColorRGBA              = "0.000 0.835 1.000 0.400"
    BlurWeight                 = "0"
    HaloWidth                  = "2"
    LinesWidth                 = "2"
    UseBase                    = "1"
    UseGlow                    = "0"
    UseHalo                    = "1"
    UseHiddenLines             = "1"
    UseLines                   = "1"
    QuickHalo                  = "0"
    DilateOne                  = "1"
 />

  <!-- colors of selected components -->
  <ComponentSelectEffectInfo
    BaseColorRGBA              = "0.545 0.671 0.863 0.400"
    BackFaceColorRGBA          = "0.545 0.671 0.863 0.200"
    HaloColorRGBA              = "0.545 0.671 0.863 0.700"
    HiddenLineColorRGBA        = "0.545 0.671 0.863 0.500"
    LineColorRGBA              = "0.000 0.000 0.000 1.000"
    GlowColorRGBA              = "0.545 0.671 0.863 0.300"
    BlurWeight                 = "0"
    HaloWidth                  = "2"
    LinesWidth                 = "2"
    UseBase                    = "1"
    UseGlow                    = "0"
    UseHalo                    = "1"
    UseHiddenLines             = "1"
    UseLines                   = "1"
    QuickHalo                  = "0"
    DilateOne                  = "1"
 />

  <!-- colors of rollover -->
  <HighlightEffectInfo
    BaseColorRGBA              = "0.894 0.675 0.475 0.400"
    BackFaceColorRGBA          = "0.894 0.675 0.475 0.200"
    HaloColorRGBA              = "0.894 0.675 0.475 0.500"
    HiddenLineColorRGBA        = "0.894 0.675 0.475 0.300"
    LineColorRGBA              = "0.894 0.675 0.475 1.000"
    GlowColorRGBA              = "0.894 0.675 0.475 0.300"
    BlurWeight                 = "0"
    HaloWidth                  = "2"
    LinesWidth                 = "2"
    UseBase                    = "1"
    UseGlow                    = "0"
    UseHalo                    = "1"
    UseHiddenLines             = "1"
    UseLines                   = "1"
    QuickHalo                  = "0"
    DilateOne                  = "1"
 />

  <MaterialPreviewSelectEffectInfo
    BaseColorRGBA              = "0.545 0.671 0.863 0.700"
    BackFaceColorRGBA          = "0.545 0.671 0.863 0.200"
    HaloColorRGBA              = "1.000 1.000 1.000 0.700"
    HiddenLineColorRGBA        = "0.545 0.671 0.863 0.500"
    LineColorRGBA              = "0.545 0.671 0.863 1.000"
    GlowColorRGBA              = "0.545 0.671 0.863 0.300"
    BlurWeight                 = "0"
    HaloWidth                  = "2"
    LinesWidth                 = "2"
    UseBase                    = "1"
    UseGlow                    = "0"
    UseHalo                    = "1"
    UseHiddenLines             = "1"
    UseLines                   = "1"
    QuickHalo                  = "0"
    DilateOne                  = "1"
 />

  <!-- seems to be viewport selection highlighting of sketches selected from the timeline or browser -->
  <SketchSelectEffectInfo
    BaseColorRGBA              = "0.545 0.671 0.863 0.400"
    BackFaceColorRGBA          = "0.545 0.671 0.863 0.200"
    HaloColorRGBA              = "0.000 0.835 1.000 1.000"
    HiddenLineColorRGBA        = "0.000 0.835 1.000 0.200"
    LineColorRGBA              = "0.000 0.835 1.000 0.800"
    GlowColorRGBA              = "0.000 0.835 1.000 1.000"
    BlurWeight                 = "0"
    HaloWidth                  = "2"
    LinesWidth                 = "2"
    UseBase                    = "1"
    UseGlow                    = "0"
    UseHalo                    = "1"
    UseHiddenLines             = "1"
    UseLines                   = "1"
    QuickHalo                  = "0"
    DilateOne                  = "1"
 />

  <!-- error highlighting -->
  <ErrorHighlightEffectInfo
    BaseColorRGBA              = "0.925 0.290 0.255 0.500"
    BackFaceColorRGBA          = "0.925 0.290 0.255 0.200"
    HaloColorRGBA              = "0.925 0.290 0.255 0.500"
    HiddenLineColorRGBA        = "0.925 0.290 0.255 0.500"
    LineColorRGBA              = "0.925 0.290 0.255 1.000"
    GlowColorRGBA              = "0.925 0.290 0.255 0.300"
    BlurWeight                 = "0"
    HaloWidth                  = "2"
    LinesWidth                 = "2"
    UseBase                    = "1"
    UseGlow                    = "0"
    UseHalo                    = "1"
    UseHiddenLines             = "1"
    UseLines                   = "1"
    QuickHalo                  = "0"
    DilateOne                  = "1"
 />

  <!-- sketch line actively being drawn color -->
  <SketchEntityColor                 ARGB = "0.800 1.000 1.000 1.000"/>
  
  <!-- when a constraint is selected highlights what it affects -->
  <SketchConstraintColor             ARGB = "1.000 0.929 0.553 0.086"/>
  
  <!-- constraint error color -->
  <SketchConflictingConstraintColor  ARGB = "1.000 0.925 0.290 0.255"/>
  <SketchConstraintHighlightedColor  ARGB = "1.000 0.416 0.753 0.906"/>
  <SketchConstraintSelectedColor     ARGB = "1.000 0.000 0.431 0.686"/>

  <SketchInferenceColor              ARGB = "1.000 0.518 0.843 0.808"/>
  <SketchInferenceMouseColor         ARGB = "1.000 0.518 0.843 0.808"/>
  <SketchProfileColor                ARGB = "0.400 0.416 0.753 0.906"/>
  
  <!-- unconstrained sketch color -->
  <SketchLineColor                   ARGB = "1.000 0.416 0.753 0.906"/>
  
  <!-- locked color -->
  <SketchFixedLineColor              ARGB = "1.000 0.624 0.788 0.400"/>
  
  <!-- projected curve color -->
  <SketchProjectedLineColor          ARGB = "1.000 0.702 0.522 0.949"/>
  
  <!-- missing reference color -->
  <SketchCachedProjectedLineColor    ARGB = "1.000 0.984 0.710 0.286"/>
  
  <!-- constrained sketch line color  -->
  <SketchFullyConstrainedColor       ARGB = "1.000 1.000 1.000 1.000"/>
  
  <!-- spline handle color -->
  <SketchHandlePointColor            ARGB = "1.000 0.529 0.702 0.251"/>
  <SketchInactiveHandleColor         ARGB = "0.800 0.529 0.702 0.251"/>
  
  <!-- spline handle if it has been user adjusted? -->
  <SketchActiveHandleColor           ARGB = "1.000 0.518 0.843 0.808"/>
  
  <!-- The construction line around a text box -->
  <TextBorderColor                   ARGB = "1.000 0.859 0.349 0.259"/>

  <!-- sketch dimension color -->
  <SketchDimensionColor              ARGB = "1.000 0.529 0.702 0.251"/>
  <SketchDrivenDimensionColor        ARGB = "0.400 0.529 0.702 0.251"/> 
  <SketchDimensionInfoColor          ARGB = "0.400 0.529 0.702 0.251"/>

  <!-- !!hot pink (waiting to see this used)!! -->
  <SketchPreviewColor                ARGB = "1.000 1.000 0.000 0.580"/>
  
  <!-- dimension color while drawing -->
  <DimensionPreviewColor             ARGB = "1.000 0.518 0.843 0.808"/>
  
  <!-- Uncontrained Sketch Construction Color -->
  <SketchConstructionColor           ARGB = "1.000 0.859 0.349 0.259"/>

  <WorkAxisColor                     ARGB = "0.800 0.000 1.000 1.000"/>
  <WorkPlaneColor                    ARGB = "0.400 0.984 0.710 0.286"/>

  <PlaneSelectionManipulatorPlane
    bounds                                = "0.350 0.350 1.150 1.150"
    DefaultColorARGB                      = "0.300 0.600 0.600 0.600"
    SelectColorARGB                       = "0.200 0.000 0.286 0.875"
    HighLightColorARGB                    = "0.600 0.302 0.345 0.961"
 />

  <!-- adorners seems to primarily be sketch entities? Work planes too? -->
  <!-- !!hot pink (debugging)!! -->
  <AdornerUnspecifiedColor            ARGB = "1.000 1.000 0.000 0.580"/>
  
  <!-- sketch line selected color -->
  <AdornerSelectedColor               ARGB = "0.500 0.000 0.835 1.000"/>
  
  <!-- sketch line rollover color -->
  <AdornerHighlightedColor            ARGB = "0.500 0.894 0.675 0.475"/>
  
  <!-- used when selecting a constraint, then rolling over it to see what it influences -->
  <AdornerSelectedAndHighlightedColor ARGB = "1.000 0.984 0.710 0.286"/>
  
  <!-- !!hot pink (waiting to see this used)!! -->
  <AdornerImplicitSelectionColor      ARGB = "1.000 1.000 0.000 0.580"/>

  <WorkPlaneAdornerColor              ARGB = "0.750 0.750 0.750 0.750"/>

  <DMBodyPreviewColor                 ARGB = "0.300 1.000 1.000 0.000"/>
  <DMEdgePreviewColor                 ARGB = "1.000 0.000 0.000 0.000"/>

  <TBCutPreviewColor                  ARGB = "0.300 1.000 0.000 0.000"/>

  <DMSculptCellColor                  ARGB = "0.100 0.000 1.000 0.000"/>

  <DraftFacePreviewColor              ARGB = "1.000 0.992 0.855 0.643"/>

  <JointBaseColor                     ARGB = "1.000 1.000 1.000 1.000"/>
  <JointDOFColor                      ARGB = "1.000 0.757 0.808 0.863"/>
  <JointDOF2Color                     ARGB = "1.000 0.404 0.518 0.651"/>
  <JointDOF3Color                     ARGB = "1.000 0.404 0.518 0.651"/>

  <!-- joint viewport dimension color -->
  <JointDimensionColor                ARGB = "1.000 0.529 0.702 0.251"/>
  
  <!-- broken joints -->
  <JointErrorColor                    ARGB = "1.000 0.925 0.290 0.255"/>
  
  <!-- model wireframe color -->
  <ModelEdgeColor                     ARGB = "1.000 0.000 0.000 0.000"/>
  
  <!-- dimension color while inspecting -->
  <MeasureDimensionColor              ARGB = "1.000 0.518 0.843 0.808"/>
  
  <!-- element color while inspecting -->
  <MeasureDimensionHighlightColor     ARGB = "1.000 0.220 0.671 0.875"/>
  
  <!-- HUD text color -->
  <DefaultMeasureTextColor            ARGB = "1.000 0.220 0.671 0.875"/>
  
  <!-- color used while creating model and construction features -->
  <InferenceDimensionColor            ARGB = "1.000 0.518 0.843 0.808"/>
<!-- END GENERATED XML -->
      `;
