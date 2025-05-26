document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', () => {
        if (!fileInput.files.length) return;
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const xmlText = e.target.result;
            visualizeTokens(xmlText);
        };
        reader.readAsText(file);
    });
});

function visualizeTokens(xmlText) {
    const tableBody = document.querySelector('#tokenTable tbody');
    tableBody.innerHTML = '';

    // Regex to match all tags (single or multi-line)
    const tagRegex = /<([A-Za-z0-9_]+)([\s\S]*?)(\/?>)/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(xmlText)) !== null) {
        const tagName = tagMatch[1];
        const attrs = tagMatch[2];

        // Find all ARGB/RGBA attributes in this tag
        const attrRegex = /\b([A-Za-z0-9_]+)\s*=\s*"([^"]+)"/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attrs)) !== null) {
            const attrName = attrMatch[1];
            const valueRaw = attrMatch[2].replace(/,/g, ' ').replace(/\s+/g, ' ').trim();

            // Only process ARGB/RGBA attributes
            if (!/(ARGB|RGBA)$/i.test(attrName)) continue;

            const format = attrName.endsWith('ARGB') ? 'ARGB' : 'RGBA';
            const rgbArr = valueRaw.split(' ').map(Number);

            // Format value as 3 decimals, mono-spaced
            const valueStr = rgbArr.map(v => v.toFixed(3)).join(' ');

            let alpha, rgb;
            if (format === 'ARGB') {
                alpha = rgbArr[0];
                rgb = rgbArr.slice(1, 4);
            } else { // RGBA
                rgb = rgbArr.slice(0, 3);
                alpha = rgbArr[3];
            }

            // Compose hex (no alpha)
            const hex = '#' + rgb.map(x => {
                let v = Math.round(x * 255);
                return v.toString(16).padStart(2, '0');
            }).join('');

            // Swatch with alpha over backgrounds
            function composite(bg) {
                return rgb.map((c, i) => Math.round((1 - alpha) * bg[i] * 255 + alpha * c * 255))
                    .map(v => v.toString(16).padStart(2, '0')).join('');
            }
            const white = [1, 1, 1], gray = [0.5, 0.5, 0.5], black = [0, 0, 0];
            const overWhite = '#' + composite(white);
            const overGray = '#' + composite(gray);
            const overBlack = '#' + composite(black);

            // Build table row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family:monospace;">${tagName} : ${attrName}</td>
                <td style="font-family:monospace;">${format}</td>
                <td style="font-family:monospace;">${valueStr}</td>
                <td style="font-family:monospace;">${hex}</td>
                <td style="font-family:monospace;">${alpha.toFixed(3)}</td>
                <td>
                    <div title="Raw RGB" style="width:24px;height:24px;background:${hex};"></div>
                </td>
                <td>
                    <div title="Alpha over white" style="width:48px;height:24px;background:linear-gradient(to right, ${overWhite} 0 50%, #fff 50% 100%);"></div>
                </td>
                <td>
                    <div title="Alpha over gray" style="width:48px;height:24px;background:linear-gradient(to right, ${overGray} 0 50%, #808080 50% 100%);"></div>
                </td>
                <td>
                    <div title="Alpha over black" style="width:48px;height:24px;background:linear-gradient(to right, ${overBlack} 0 50%, #000 50% 100%);"></div>
                </td>
            `;
            tableBody.appendChild(tr);
        }
    }
}