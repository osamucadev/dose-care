"""Generates DoseCare SVG assets from the prototype palette.

Avatars are defined once as <g> fragments in a 96x96 box so the
illustrations can reuse them with transforms.
"""
import math
import os
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "assets", "svg")

C = {
    'teal': '#267C7F',
    'teal_dark': '#1F6F72',
    'teal_soft': '#8FC5C3',
    'mint': '#D9F1EB',
    'navy': '#1E3A52',
    'cream': '#FEFAF2',
    'logo_blue': '#609BAA',
    'logo_green': '#52B2A3',
    'skin': '#F6C9A0',
    'skin_shadow': '#E8AE85',
    'skin_dark': '#E9B48E',
    'eye': '#3B2A24',
    'cheek': '#F29E8E',
    'mouth': '#A9573F',
    'yellow': '#F6C14F',
    'terracotta': '#D9875A',
    'leaf': '#5FA86A',
    'leaf_dark': '#4E9A5C',
    'leaf_light': '#77BD7F',
    'sky': '#DCEAF6',
}


def svg(view_box, body, w=None, h=None):
    size = f' width="{w}" height="{h}"' if w else ''
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}"{size} fill="none">\n'
        f'{body}\n</svg>\n'
    )


def write(rel, content):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)


# ---------------------------------------------------------------------
# Faces (shared by avatars and illustrations), drawn in a 96x96 box.
# ---------------------------------------------------------------------

def face_features(cx=48, eye_y=48, spread=8, skin_cheek=C['cheek']):
    return f'''
  <circle cx="{cx - spread}" cy="{eye_y}" r="2.6" fill="{C['eye']}"/>
  <circle cx="{cx + spread}" cy="{eye_y}" r="2.6" fill="{C['eye']}"/>
  <circle cx="{cx - spread - 5}" cy="{eye_y + 7}" r="3.6" fill="{skin_cheek}" opacity="0.5"/>
  <circle cx="{cx + spread + 5}" cy="{eye_y + 7}" r="3.6" fill="{skin_cheek}" opacity="0.5"/>
  <path d="M{cx - 6} {eye_y + 9} Q{cx} {eye_y + 14} {cx + 6} {eye_y + 9}" stroke="{C['mouth']}" stroke-width="2.2" stroke-linecap="round"/>'''


def child_figure():
    return f'''
  <path d="M16 100 C18 78 31 71 48 71 C65 71 78 78 80 100 Z" fill="#7DBF8E"/>
  <path d="M40 71 Q48 78 56 71" stroke="#5FA374" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="42" y="60" width="12" height="13" rx="5" fill="{C['skin_shadow']}"/>
  <circle cx="27" cy="49" r="5" fill="{C['skin']}"/>
  <circle cx="69" cy="49" r="5" fill="{C['skin']}"/>
  <ellipse cx="48" cy="47" rx="21" ry="22" fill="{C['skin']}"/>
  <path d="M27 46 C25 29 35 20 48 20 C61 20 71 28 69 44 C65 38 59 34 53 32 C50 37 43 39 37 37 C33 39 29 42 27 46 Z" fill="#D9783A"/>
  <path d="M45 20 C47 15 52 14 55 17" stroke="#D9783A" stroke-width="4" stroke-linecap="round"/>''' + face_features()


def adult_figure():
    return f'''
  <path d="M23 74 C18 50 22 21 48 20 C74 21 78 50 73 74 Z" fill="#2F2A35"/>
  <path d="M15 100 C17 79 31 73 48 73 C65 73 79 79 81 100 Z" fill="#6E9BD1"/>
  <path d="M41 73 L48 81 L55 73" fill="#F2C29E"/>
  <rect x="42" y="60" width="12" height="14" rx="5" fill="{C['skin_dark']}"/>
  <ellipse cx="48" cy="47" rx="19" ry="21" fill="#F2C29E"/>
  <path d="M29 47 C28 31 37 24 48 24 C59 24 68 31 67 44 C60 41 53 36 49 30 C45 37 37 43 29 47 Z" fill="#2F2A35"/>''' + face_features()


def elderly_figure():
    return f'''
  <circle cx="48" cy="20" r="9" fill="#CFC8C3"/>
  <path d="M15 100 C17 79 31 73 48 73 C65 73 79 79 81 100 Z" fill="#B79AD6"/>
  <path d="M38 74 C42 80 54 80 58 74" stroke="#9C7EC2" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="42" y="60" width="12" height="14" rx="5" fill="{C['skin_dark']}"/>
  <circle cx="27" cy="49" r="5" fill="#F3C7A6"/>
  <circle cx="69" cy="49" r="5" fill="#F3C7A6"/>
  <ellipse cx="48" cy="48" rx="20" ry="21" fill="#F3C7A6"/>
  <path d="M26 50 C22 32 33 23 48 23 C63 23 74 32 70 50 C67 42 61 37 55 36 C51 38 44 38 40 36 C34 37 29 42 26 50 Z" fill="#DAD4D0"/>
  <path d="M41 51 Q44 50 47 51" stroke="#B9918A" stroke-width="0"/>''' + face_features(eye_y=50) + f'''
  <circle cx="40" cy="50" r="6.2" stroke="#8A6A5A" stroke-width="1.8"/>
  <circle cx="56" cy="50" r="6.2" stroke="#8A6A5A" stroke-width="1.8"/>
  <path d="M46.2 49.5 Q48 48 49.8 49.5" stroke="#8A6A5A" stroke-width="1.8" stroke-linecap="round"/>'''


def dog_figure():
    return f'''
  <path d="M24 100 C26 82 36 75 48 75 C60 75 70 82 72 100 Z" fill="#C79465"/>
  <path d="M41 75 C44 84 52 84 55 75" fill="#F1DCC4"/>
  <ellipse cx="48" cy="51" rx="20" ry="20" fill="#C79465"/>
  <path d="M30 34 C19 36 16 55 22 66 C29 65 32 52 35 41 Z" fill="#6B4630"/>
  <path d="M66 34 C77 36 80 55 74 66 C67 65 64 52 61 41 Z" fill="#6B4630"/>
  <path d="M44 32 C45 42 45 50 48 55 C51 50 51 42 52 32 C49 30 47 30 44 32 Z" fill="#F1DCC4"/>
  <ellipse cx="48" cy="61" rx="11.5" ry="8.5" fill="#F1DCC4"/>
  <ellipse cx="48" cy="56.5" rx="4.2" ry="3.2" fill="#3A2A22"/>
  <circle cx="39.5" cy="48" r="2.7" fill="#3A2A22"/>
  <circle cx="56.5" cy="48" r="2.7" fill="#3A2A22"/>
  <path d="M48 59.5 V62 M43.5 62.5 Q48 66 52.5 62.5" stroke="#7A4E36" stroke-width="2" stroke-linecap="round"/>'''


def plant_figure():
    return f'''
  <ellipse cx="48" cy="78" rx="18" ry="4" fill="#9CC98F"/>
  <path d="M48 77 V44" stroke="#3F8A4E" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M48 62 C35 64 24 56 24 42 C37 40 47 49 48 62 Z" fill="{C['leaf']}"/>
  <path d="M48 56 C59 58 72 49 72 35 C59 33 49 42 48 56 Z" fill="{C['leaf_dark']}"/>
  <path d="M48 46 C41 38 41 26 48 18 C55 26 55 38 48 46 Z" fill="{C['leaf_light']}"/>
  <path d="M46 60 C40 56 34 51 29 45 M50 54 C56 50 62 45 67 39 M48 42 V25" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.5" stroke-linecap="round"/>'''


AVATARS = {
    'child': ('#FCE3A6', child_figure),
    'adult': ('#D6E6FB', adult_figure),
    'elderly': ('#EADCF5', elderly_figure),
    'pet': ('#D3EDD8', dog_figure),
    'plant': ('#DCF0D3', plant_figure),
}


def avatar_group(kind, uid):
    bg, fig = AVATARS[kind]
    return f'''<defs><clipPath id="clip-{uid}"><circle cx="48" cy="48" r="48"/></clipPath></defs>
<circle cx="48" cy="48" r="48" fill="{bg}"/>
<g clip-path="url(#clip-{uid})">{fig()}
</g>'''


for kind in AVATARS:
    write(f'avatars/{kind}.svg', svg('0 0 96 96', avatar_group(kind, kind), 96, 96))


# ---------------------------------------------------------------------
# Brand
# ---------------------------------------------------------------------

LOGO_BODY = f'''
  <path d="M27 52 C14 44 5 33 6 21 C7 11 17 5.5 26 9.5 C34 13 37 22 36 30 C35 37 32 44 27 52 Z" fill="{C['logo_blue']}"/>
  <path d="M26 9.5 C34 13 37 22 36 30 C35.5 33.5 34.5 36.5 33.2 39.5 C33 30 30.5 20 23.5 12.5 C24.2 11.2 25 10.2 26 9.5 Z" fill="#4A8696" opacity="0.6"/>
  <path transform="translate(3.5 0.5)" d="M33 57.5 C28 50 28 38 35 30 C42 22 52 18.5 57.5 23 C62.5 27 61 37 55 45 C49.5 52.5 41 57.5 33 57.5 Z" fill="{C['logo_green']}"/>'''

write('brand/logo-mark.svg', svg('0 0 64 64', LOGO_BODY, 64, 64))
import re
write(
    'brand/logo-mark-mono.svg',
    svg('0 0 64 64', re.sub(r'\n  <path[^\n]*#4A8696[^\n]*', '', LOGO_BODY).replace(C['logo_blue'], 'currentColor').replace(C['logo_green'], 'currentColor'), 64, 64),
)


# ---------------------------------------------------------------------
# Icons: 24x24, stroke = currentColor, so the RN side sets color.
# ---------------------------------------------------------------------

def icon(body, filled=False):
    attrs = (
        'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'
        if not filled
        else ''
    )
    return svg('0 0 24 24', f'<g {attrs}>{body}</g>', 24, 24)


def gear_path(cx=12, cy=12, r_out=9, r_in=7, teeth=8):
    pts = []
    step = 2 * math.pi / teeth
    for i in range(teeth):
        a = i * step
        for da, r in ((-0.30, r_in), (-0.17, r_out), (0.17, r_out), (0.30, r_in)):
            pts.append((cx + r * math.cos(a + da * step * 1.6), cy + r * math.sin(a + da * step * 1.6)))
    d = 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in pts) + ' Z'
    return d


ICONS = {
    'home': '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5.5H9V20H5a1 1 0 0 1-1-1z"/>',
    'home-filled': None,
    'profiles': '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2"/><circle cx="16.5" cy="9" r="2.6"/><path d="M15.8 14.3c2.5-.3 4.4 1.3 4.9 4.4"/>',
    'history': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'more': '<path d="M5 7h14M5 12h14M5 17h14"/>',
    'settings': f'<path d="{gear_path()}"/><circle cx="12" cy="12" r="3"/>',
    'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'circle': '<circle cx="12" cy="12" r="8.5"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'chevron-left': '<path d="m15 5-7 7 7 7"/>',
    'chevron-right': '<path d="m9 5 7 7-7 7"/>',
    'chevron-down': '<path d="m5 9 7 7 7-7"/>',
    'close': '<path d="M6 6l12 12M18 6 6 18"/>',
    'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'calendar': '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    'camera': '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2.2h5.6L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.3"/>',
    'bell': '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    'pill': '<rect x="2.8" y="8.3" width="18.4" height="7.4" rx="3.7" transform="rotate(-45 12 12)"/><path d="m8.8 8.8 6.4 6.4"/>',
    'moon': '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
    'edit': '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    'search': '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    'mail': '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
}

for name, body in ICONS.items():
    if body is None:
        continue
    write(f'icons/{name}.svg', icon(body))

# Filled variants used by the tab bar's active state and the dose checklist.
write(
    'icons/home-filled.svg',
    svg('0 0 24 24', '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5.5H9V20H5a1 1 0 0 1-1-1z" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>', 24, 24),
)
write(
    'icons/check-circle.svg',
    svg('0 0 24 24', '<circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="m7.5 12.3 3 3 6-6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', 24, 24),
)


# ---------------------------------------------------------------------
# Illustrations
# ---------------------------------------------------------------------

def leaf(x, y, scale=1.0, rot=0, fill=C['leaf']):
    return (
        f'<g transform="translate({x} {y}) rotate({rot}) scale({scale})">'
        f'<path d="M0 0 C-10 -8 -10 -26 0 -38 C10 -26 10 -8 0 0 Z" fill="{fill}"/>'
        f'<path d="M0 -4 V-32" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.4" stroke-linecap="round"/>'
        '</g>'
    )


def potted_plant(x, y, s=1.0):
    return f'''<g transform="translate({x} {y}) scale({s})">
    {leaf(0, 0, 1.0, -38, C['leaf'])}
    {leaf(0, 0, 1.15, -8, C['leaf_dark'])}
    {leaf(0, 0, 1.0, 22, C['leaf'])}
    {leaf(0, 0, 0.8, 48, C['leaf_light'])}
    <path d="M-17 -2 H17 L13 30 H-13 Z" fill="{C['terracotta']}"/>
    <rect x="-19" y="-6" width="38" height="8" rx="2.5" fill="#C9744A"/>
  </g>'''


def placed_avatar(kind, x, y, size, uid, ring=True):
    s = size / 96
    ring_el = f'<circle cx="48" cy="48" r="49.5" stroke="#FFFFFF" stroke-width="{3 / s:.2f}"/>' if ring else ''
    return f'<g transform="translate({x} {y}) scale({s:.4f})">{avatar_group(kind, uid)}{ring_el}</g>'


def heart(x, y, s=1.0, fill='#F28C8C'):
    return (
        f'<path transform="translate({x} {y}) scale({s})" '
        f'd="M0 6 C-8 0 -12 -6 -8 -11 C-5 -14 -1 -13 0 -9 C1 -13 5 -14 8 -11 C12 -6 8 0 0 6 Z" fill="{fill}"/>'
    )


# Onboarding 2/3: phone with checklist + bell + plant.
check_rows = ''
for i, done in enumerate([True, True, False, False]):
    y = 70 + i * 30
    check_rows += f'''
    <rect x="104" y="{y}" width="16" height="16" rx="4" fill="#E3EEF2" stroke="#BFD3DA" stroke-width="1.2"/>
    {'<path d="m107.5 %d 3.5 3.5 6.5 -7.5" stroke="%s" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' % (y + 8, C['teal']) if done else '<path d="m108.5 %d 2.5 2.5 4.5 -5" stroke="#8FB0BC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' % (y + 8)}
    <rect x="128" y="{y + 6}" width="{58 if i % 2 == 0 else 46}" height="4" rx="2" fill="#D5DCE0"/>'''

reminders = f'''
  <path d="M60 60 C40 70 38 150 62 176 L78 176 L78 60 Z" fill="{C['sky']}"/>
  <path d="M206 96 C236 100 246 160 220 184 L196 184 Z" fill="{C['sky']}"/>
  <rect x="86" y="24" width="112" height="164" rx="16" fill="#FFFFFF" stroke="{C['teal']}" stroke-width="6"/>
  <path d="M124 24 h36 v4 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 Z" fill="{C['teal']}"/>
  <rect x="104" y="48" width="48" height="4" rx="2" fill="#D5DCE0"/>
  <circle cx="104" cy="50" r="2.5" fill="#BFCBD1"/>
  {check_rows}
  <rect x="166" y="60" width="54" height="54" rx="18" fill="{C['yellow']}"/>
  <path d="M182 98 V88 a11 11 0 0 1 22 0 V98 l3 3 H179 Z" fill="#FFFFFF"/>
  <path d="M189 103.5 a4 4 0 0 0 8 0" fill="#FFFFFF"/>
  <rect x="190" y="72" width="6" height="5" rx="2.5" fill="#FFFFFF"/>
  {potted_plant(70, 154, 1.05)}
  <path d="M40 190 H240" stroke="#BFD3DA" stroke-width="2" stroke-linecap="round"/>'''
write('illustrations/onboarding-reminders.svg', svg('0 0 280 210', reminders, 280, 210))


# Onboarding 1/3: caregiver with pet, plants and a heart.
care = f'''
  <path d="M40 120 C30 60 90 18 150 24 C214 30 252 80 238 136 C226 186 160 200 110 194 C66 188 46 160 40 120 Z" fill="#FBEBC8" opacity="0.7"/>
  {leaf(46, 176, 1.3, -30, C['leaf'])}
  {leaf(52, 178, 1.5, -6, C['leaf_dark'])}
  {leaf(60, 180, 1.1, 26, C['leaf_light'])}
  {leaf(226, 170, 1.4, 20, C['leaf'])}
  {leaf(220, 176, 1.1, -20, C['leaf_light'])}
  <g transform="translate(78 14) scale(1.25)">
    <path d="M18 120 C16 70 22 18 48 16 C76 18 82 70 80 120 Z" fill="#6B3F2A"/>
    <path d="M6 150 C10 108 28 96 48 96 C70 96 88 108 92 150 Z" fill="#B79AD6"/>
    <rect x="42" y="64" width="13" height="16" rx="5" fill="{C['skin_dark']}"/>
    <ellipse cx="48" cy="48" rx="21" ry="23" fill="{C['skin']}"/>
    <path d="M26 52 C24 30 34 20 48 20 C64 20 74 32 70 50 C62 44 54 36 50 28 C46 40 36 48 26 52 Z" fill="#6B3F2A"/>
    {face_features(eye_y=50).replace('Q48 64 54 59', 'Q48 64 54 59')}
  </g>
  <g transform="translate(132 96) scale(1.05)">{dog_figure()}</g>
  <path d="M120 176 C130 168 146 168 160 176 C168 181 176 182 184 178" stroke="#A386C9" stroke-width="13" stroke-linecap="round"/>
  <circle cx="186" cy="176" r="7" fill="{C['skin']}"/>
  {heart(206, 52, 1.6)}
  <path d="M30 196 H250" stroke="#E7DCC4" stroke-width="2" stroke-linecap="round"/>'''
write('illustrations/onboarding-care.svg', svg('0 0 280 210', care, 280, 210))


# Onboarding 3/3: caregiver in the center, the lives they care for around.
calm = f'''
  <circle cx="140" cy="112" r="92" fill="#FBF3E2"/>
  <circle cx="140" cy="112" r="70" stroke="#E7DCC4" stroke-width="1.5" stroke-dasharray="4 6"/>
  <g transform="translate(96 66) scale(0.92)">
    <path d="M18 100 C14 56 22 18 48 16 C76 18 82 56 78 100 Z" fill="#6B3F2A"/>
    <path d="M4 112 C10 90 28 84 48 84 C70 84 86 90 92 112 Z" fill="#B79AD6"/>
    <rect x="42" y="62" width="12" height="14" rx="5" fill="{C['skin_dark']}"/>
    <ellipse cx="48" cy="47" rx="20" ry="22" fill="{C['skin']}"/>
    <path d="M27 50 C25 30 35 20 48 20 C63 20 73 31 69 48 C62 43 54 35 50 28 C46 39 37 46 27 50 Z" fill="#6B3F2A"/>
    {face_features(eye_y=49)}
  </g>
  {placed_avatar('child', 32, 46, 46, 'calm-child')}
  {placed_avatar('adult', 118, 2, 44, 'calm-adult')}
  {placed_avatar('elderly', 204, 40, 46, 'calm-elderly')}
  {placed_avatar('pet', 30, 132, 46, 'calm-pet')}
  {placed_avatar('plant', 206, 130, 46, 'calm-plant')}'''
write('illustrations/onboarding-calm.svg', svg('0 0 280 210', calm, 280, 210))


# Splash: the whole "family" of lives over a soft lilac blob.
splash = f'''
  <path d="M0 90 C40 40 110 30 160 50 C210 70 250 40 280 60 V210 H0 Z" fill="#E6DDF5"/>
  {potted_plant(244, 166, 1.0)}
  {placed_avatar('adult', 96, 36, 84, 'splash-adult')}
  {placed_avatar('elderly', 168, 84, 74, 'splash-elderly')}
  {placed_avatar('child', 28, 92, 72, 'splash-child')}
  {placed_avatar('pet', 96, 124, 76, 'splash-pet')}'''
write('illustrations/splash-family.svg', svg('0 0 280 210', splash, 280, 210))

print('ok')
