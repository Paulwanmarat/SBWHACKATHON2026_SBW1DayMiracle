import os
import subprocess

html_path = r'd:\SBW-Miracle\data\research\slide.html'
svg_path = r'd:\SBW-Miracle\data\research\demo_slide_s001.svg'
png_path = r'C:\Users\admin\.gemini\antigravity-ide\brain\8c3f541a-081e-4b0b-89db-09c5b0a38009\slide_screenshot.png'

with open(svg_path, 'r', encoding='utf-8') as f:
    svg_content = f.read()

html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background: #ffffff;
  }}
  svg {{
    width: 1920px;
    height: 1080px;
  }}
</style>
</head>
<body>
{svg_content}
</body>
</html>
"""

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

edge_bin = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_bin,
    "--headless",
    "--disable-gpu",
    "--window-size=1920,1080",
    f"--screenshot={png_path}",
    f"file:///{html_path.replace('\\', '/')}"
]

print("Running command:", " ".join(cmd))
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
print("Output:", res.stdout, res.stderr)
print("File exists:", os.path.exists(png_path))
