# Fusion Viewport Theming Tool

A web-based tool for creating and customizing **viewport color themes** for Autodesk Fusion 360. This tool allows you to visually edit the semantic color categories used in Fusion's environment XML files, generate new XML code, and apply your own viewport themes.

---

## Features

- **Visual Color Editing:** Adjust colors for selection, highlights, sketches, joints, and more using a palette or custom hex values.
- **Semantic Grouping:** Colors are organized by their function (e.g., Selection, Sketch, Inspection), making them easier to understand and modify.
- **Live Preview:** Instantly see your color choices in the UI.
- **XML Generation:** Generate the XML snippet needed to update your Fusion 360 environment theme.
- **Background Color Helper:** Easily set and copy the correct XML for environment backgrounds.

---

## Usage

1. **Open the Tool:**  
   Open `index.html` in your browser.

2. **Edit Colors:**  
   Click any color swatch to open the palette and select a new color, or enter a custom hex code.

3. **Set Background Color:**  
   Use the background color picker at the top to set your preferred viewport background. The tool will show you the exact XML lines to use.

4. **Generate XML:**  
   Click **Generate XML** to get the XML code for your theme.  
   - The generated code replaces all lines **after** `</DisplayName>` but **before** `<Simulation>` in your environment XML file.
   - The background color lines replace the lines like (typically toward the top of the xml file):
     ```
     <Background RGB="..."/>
     <RRTBackground RGB="..."/>
     ```

5. **Apply to Fusion 360:**  
   1. **Locate the XML file** for your environment.  
      - **Windows:**  
        `C:\Users\<your-user>\AppData\Local\Autodesk\webdeploy\production\<hash>\Neutron\Server\Scene\Resources\Environments\<EnvironmentName>\<EnvironmentName>.xml`
      - **Mac:**  
        `/Users/<your-user>/Library/Application Support/Autodesk/webdeploy/production/<hash>/Autodesk Fusion.app/Contents/Libraries/Neutron/Neutron/Server/Scene/Resources/Environments/<EnvironmentName>/<EnvironmentName>.xml`
   2. **Backup the original XML file.**
   3. **Replace** the relevant section with your generated XML.
   4. **Restart Fusion 360** to see your changes.

---

try it here:
http://dev.maruskadesign.com/fusion-viewport-themer/index.html


## Notes

- The tool does **not** directly modify Fusion 360 files; you must copy and paste the generated XML manually.
- The semantic mapping is based on observed usage and may evolve as more tokens are understood.
- Always backup your original XML files before making changes.

---

## License

MIT License

---

## Credits

Created by [your name].  
Autodesk® and Fusion 360® are registered trademarks of Autodesk, Inc. This project is not affiliated with or endorsed by Autodesk.
