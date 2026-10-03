"""Generates the app icon, Android adaptive icon layers, splash image,
favicon and notification icon from assets/svg/brand/logo-mark.svg, so the
SVG stays the single source of the logo. Requires Pillow.

    python3 scripts/generate-app-icons.py

The logo is drawn with cubic Bezier paths only (M, C, Z), which is all
logo-mark.svg uses; a richer SVG would need a real rasterizer.
"""
import os
import re

from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
LOGO_SVG = os.path.join(ROOT, 'assets', 'svg', 'brand', 'logo-mark.svg')
OUT = os.path.join(ROOT, 'assets', 'images')

CREAM = (254, 250, 242, 255)  # Colors.light.background
SUPERSAMPLE = 4


def parse_logo():
    """Returns [(points, rgba)] in the SVG's 64x64 space, in paint order."""
    shapes = []
    for tag in re.findall(r'<path\b[^>]*>', open(LOGO_SVG).read()):
        d = re.search(r'\sd="([^"]+)"', tag).group(1)
        fill = re.search(r'fill="#([0-9A-Fa-f]{6})"', tag).group(1)
        opacity_match = re.search(r'opacity="([\d.]+)"', tag)
        opacity = float(opacity_match.group(1)) if opacity_match else 1.0
        translate = re.search(r'translate\(([-\d.]+) ([-\d.]+)\)', tag)
        dx, dy = (float(translate.group(1)), float(translate.group(2))) if translate else (0.0, 0.0)

        nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', d)]
        points = [(nums[0], nums[1])]
        for i in range(2, len(nums) - 5, 6):
            p0, p1, p2, p3 = points[-1], (nums[i], nums[i + 1]), (nums[i + 2], nums[i + 3]), (nums[i + 4], nums[i + 5])
            for step in range(1, 41):
                t = step / 40
                points.append(tuple(
                    (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * e
                    for a, b, c, e in zip(p0, p1, p2, p3)
                ))
        rgb = tuple(int(fill[k:k + 2], 16) for k in (0, 2, 4))
        shapes.append(([(x + dx, y + dy) for x, y in points], rgb + (round(255 * opacity),)))
    return shapes


SHAPES = parse_logo()
_xs = [x for pts, _ in SHAPES for x, _ in pts]
_ys = [y for pts, _ in SHAPES for _, y in pts]
BBOX = (min(_xs), min(_ys), max(_xs), max(_ys))


def render(size, logo_width, background=None, mono=None):
    """`logo_width` is the logo's visual width as a fraction of `size`.
    `mono` paints every shape in that RGBA color (adaptive monochrome,
    notification icon); otherwise the logo keeps its own colors."""
    big = size * SUPERSAMPLE
    canvas = Image.new('RGBA', (big, big), background or (0, 0, 0, 0))
    bw, bh = BBOX[2] - BBOX[0], BBOX[3] - BBOX[1]
    scale = logo_width * big / bw
    ox = (big - bw * scale) / 2 - BBOX[0] * scale
    oy = (big - bh * scale) / 2 - BBOX[1] * scale

    for points, color in SHAPES:
        if mono and color[3] < 255:
            continue  # shading only makes sense in color
        layer = Image.new('RGBA', (big, big), (0, 0, 0, 0))
        ImageDraw.Draw(layer).polygon([(x * scale + ox, y * scale + oy) for x, y in points], fill=mono or color)
        canvas = Image.alpha_composite(canvas, layer)
    return canvas.resize((size, size), Image.LANCZOS)


def save(name, image):
    image.save(os.path.join(OUT, name))
    print('wrote', name, image.size)


# iOS / generic icon: opaque, the OS applies its own rounded mask.
save('icon.png', render(1024, 0.62, background=CREAM))

# Android adaptive icon: launchers crop the 108dp canvas to any shape
# inside a 66dp safe circle, so the logo stays well within it.
save('android-icon-foreground.png', render(1024, 0.44))
save('android-icon-background.png', Image.new('RGBA', (1024, 1024), CREAM))
save('android-icon-monochrome.png', render(1024, 0.44, mono=(255, 255, 255, 255)))

# Splash: logo only, the splash background color comes from app.json.
# Android 12+ masks the splash icon to a circle two thirds of its size,
# so the logo has to fit inside that circle, not the square.
save('splash-icon.png', render(1024, 0.56))

# Web tab icon.
save('favicon.png', render(48, 0.92))

# Android status bar: white silhouette with some padding.
save('notification-icon.png', render(96, 0.8, mono=(255, 255, 255, 255)))
