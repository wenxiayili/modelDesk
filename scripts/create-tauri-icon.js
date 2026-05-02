const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourcePath = path.resolve(process.argv[2] || path.join(root, "src-tauri", "icons", "icon.png"));
const outputPath = path.join(root, "src-tauri", "icons", "icon.ico");

if (!fs.existsSync(sourcePath)) {
  console.error(`Icon source not found: ${sourcePath}`);
  process.exit(1);
}

const script = String.raw`
using namespace System.Drawing
using namespace System.Drawing.Imaging

$sourcePath = $env:MODEL_DESK_ICON_SOURCE
$outputPath = $env:MODEL_DESK_ICON_OUTPUT
$sizes = @(16, 24, 32, 48, 64, 128, 256)

Add-Type -AssemblyName System.Drawing

function New-IconPngBytes {
    param(
        [System.Drawing.Image]$Source,
        [int]$Size
    )

    $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $side = [Math]::Min($Source.Width, $Source.Height)
    $sourceX = [Math]::Floor(($Source.Width - $side) / 2)
    $sourceY = [Math]::Floor(($Source.Height - $side) / 2)
    $srcRect = [System.Drawing.Rectangle]::new($sourceX, $sourceY, $side, $side)
    $dstRect = [System.Drawing.Rectangle]::new(0, 0, $Size, $Size)
    $graphics.DrawImage($Source, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $stream = [System.IO.MemoryStream]::new()
    $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    [byte[]]$bytes = $stream.ToArray()

    $stream.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
    return ,$bytes
}

$image = [System.Drawing.Image]::FromFile($sourcePath)
try {
    $entries = New-Object System.Collections.Generic.List[object]
    foreach ($size in $sizes) {
        [byte[]]$pngBytes = New-IconPngBytes -Source $image -Size $size
        $entries.Add([pscustomobject]@{
            Size = $size
            Bytes = $pngBytes
        })
    }

    $stream = [System.IO.File]::Open($outputPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
    $writer = [System.IO.BinaryWriter]::new($stream)
    try {
        $writer.Write([UInt16]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]$entries.Count)

        $dataOffset = 6 + ($entries.Count * 16)
        foreach ($entry in $entries) {
            $dimension = if ($entry.Size -eq 256) { 0 } else { $entry.Size }
            $writer.Write([byte]$dimension)
            $writer.Write([byte]$dimension)
            $writer.Write([byte]0)
            $writer.Write([byte]0)
            $writer.Write([UInt16]1)
            $writer.Write([UInt16]32)
            $writer.Write([UInt32]$entry.Bytes.Length)
            $writer.Write([UInt32]$dataOffset)
            $dataOffset += $entry.Bytes.Length
        }

        foreach ($entry in $entries) {
            $writer.Write([byte[]]$entry.Bytes)
        }
    } finally {
        $writer.Dispose()
        $stream.Dispose()
    }
} finally {
    $image.Dispose()
}
`;

const result = spawnSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "-"], {
  input: script,
  encoding: "utf8",
  env: {
    ...process.env,
    MODEL_DESK_ICON_SOURCE: sourcePath,
    MODEL_DESK_ICON_OUTPUT: outputPath
  }
});

if (result.status !== 0) {
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  process.exit(result.status || 1);
}

const stats = fs.statSync(outputPath);
console.log(`Created ${outputPath} (${stats.size} bytes)`);
