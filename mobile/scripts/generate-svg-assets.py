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


def baby_figure():
    return f'''
  <path d="M18 100 C20 80 32 74 48 74 C64 74 76 80 78 100 Z" fill="#9CC3E8"/>
  <circle cx="48" cy="80" r="5" fill="#FFFFFF" opacity="0.7"/>
  <circle cx="25" cy="50" r="5.5" fill="{C['skin']}"/>
  <circle cx="71" cy="50" r="5.5" fill="{C['skin']}"/>
  <circle cx="48" cy="49" r="24" fill="{C['skin']}"/>
  <path d="M44 26 C44 20 52 19 52 24 C52 27 48 28 47 26" stroke="#C7783E" stroke-width="3" stroke-linecap="round"/>''' + face_features(eye_y=50, spread=9)


def girl_figure():
    return f'''
  <circle cx="22" cy="44" r="9" fill="#7A4A2E"/>
  <circle cx="74" cy="44" r="9" fill="#7A4A2E"/>
  <circle cx="26" cy="38" r="3" fill="#F29E8E"/>
  <circle cx="70" cy="38" r="3" fill="#F29E8E"/>
  <path d="M16 100 C18 78 31 71 48 71 C65 71 78 78 80 100 Z" fill="#F2A7B5"/>
  <rect x="42" y="60" width="12" height="13" rx="5" fill="{C['skin_shadow']}"/>
  <ellipse cx="48" cy="47" rx="21" ry="22" fill="{C['skin']}"/>
  <path d="M27 47 C25 29 35 21 48 21 C61 21 71 29 69 47 C66 40 62 34 56 32 C50 36 40 35 34 33 C30 37 28 41 27 47 Z" fill="#7A4A2E"/>''' + face_features()


def man_figure():
    return f'''
  <path d="M15 100 C17 79 31 73 48 73 C65 73 79 79 81 100 Z" fill="#5E9C8F"/>
  <path d="M40 73 L48 82 L56 73" fill="#E9F2EF"/>
  <rect x="42" y="60" width="12" height="14" rx="5" fill="{C['skin_dark']}"/>
  <circle cx="28" cy="48" r="5" fill="#EDBB94"/>
  <circle cx="68" cy="48" r="5" fill="#EDBB94"/>
  <ellipse cx="48" cy="47" rx="19" ry="21" fill="#EDBB94"/>
  <path d="M29 44 C28 28 38 22 49 23 C60 24 68 30 67 43 C63 36 56 33 50 32 C43 33 35 37 29 44 Z" fill="#3A2C25"/>''' + face_features() + '''
  <path d="M36 58 C40 67 56 67 60 58 C58 64 38 64 36 58 Z" fill="#3A2C25" opacity="0.85"/>'''


def elderly_man_figure():
    return f'''
  <path d="M15 100 C17 79 31 73 48 73 C65 73 79 79 81 100 Z" fill="#9C8BC0"/>
  <path d="M38 74 C42 80 54 80 58 74" stroke="#857AAE" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="42" y="60" width="12" height="14" rx="5" fill="{C['skin_dark']}"/>
  <circle cx="27" cy="49" r="5" fill="#F3C7A6"/>
  <circle cx="69" cy="49" r="5" fill="#F3C7A6"/>
  <ellipse cx="48" cy="48" rx="20" ry="21" fill="#F3C7A6"/>
  <path d="M27 50 C25 40 28 34 33 32 C32 38 32 44 31 50 Z M69 50 C71 40 68 34 63 32 C64 38 64 44 65 50 Z" fill="#DAD4D0"/>''' + face_features(eye_y=50) + f'''
  <path d="M41 57.5 C44 55.5 52 55.5 55 57.5 C52 59 44 59 41 57.5 Z" fill="#CFC8C3"/>
  <circle cx="40" cy="50" r="6.2" stroke="#8A6A5A" stroke-width="1.8"/>
  <circle cx="56" cy="50" r="6.2" stroke="#8A6A5A" stroke-width="1.8"/>
  <path d="M46.2 49.5 Q48 48 49.8 49.5" stroke="#8A6A5A" stroke-width="1.8" stroke-linecap="round"/>'''


def cat_figure():
    return f'''
  <path d="M24 100 C26 82 36 76 48 76 C60 76 70 82 72 100 Z" fill="#E59A52"/>
  <path d="M28 46 L30 22 L44 34 Z" fill="#E59A52"/>
  <path d="M68 46 L66 22 L52 34 Z" fill="#E59A52"/>
  <path d="M31 40 L32 28 L40 35 Z M65 40 L64 28 L56 35 Z" fill="#F6C6A8"/>
  <ellipse cx="48" cy="52" rx="22" ry="20" fill="#E59A52"/>
  <path d="M41 33 C43 37 53 37 55 33 M38 38 C42 42 54 42 58 38" stroke="#C97A35" stroke-width="2.4" stroke-linecap="round"/>
  <ellipse cx="48" cy="61" rx="10" ry="7" fill="#FBE3D0"/>
  <path d="M45.5 57 H50.5 L48 60 Z" fill="#B85F55"/>
  <ellipse cx="39.5" cy="50" rx="2.6" ry="3.4" fill="#3A2A22"/>
  <ellipse cx="56.5" cy="50" rx="2.6" ry="3.4" fill="#3A2A22"/>
  <path d="M48 60 V62 M44 63.5 Q48 66.5 52 63.5 M30 58 H39 M30 63 L39 61 M66 58 H57 M66 63 L57 61" stroke="#8A5530" stroke-width="1.6" stroke-linecap="round"/>'''


def rabbit_figure():
    return f'''
  <path d="M24 100 C26 82 36 76 48 76 C60 76 70 82 72 100 Z" fill="#E7E1DA"/>
  <ellipse cx="38" cy="22" rx="6.5" ry="18" fill="#E7E1DA"/>
  <ellipse cx="58" cy="22" rx="6.5" ry="18" fill="#E7E1DA"/>
  <ellipse cx="38" cy="23" rx="3" ry="13" fill="#F4C3C8"/>
  <ellipse cx="58" cy="23" rx="3" ry="13" fill="#F4C3C8"/>
  <ellipse cx="48" cy="54" rx="21" ry="19" fill="#F3EEE8"/>
  <circle cx="39.5" cy="51" r="2.7" fill="#3A2A22"/>
  <circle cx="56.5" cy="51" r="2.7" fill="#3A2A22"/>
  <circle cx="34" cy="58" r="3.4" fill="{C['cheek']}" opacity="0.45"/>
  <circle cx="62" cy="58" r="3.4" fill="{C['cheek']}" opacity="0.45"/>
  <path d="M45.5 57 H50.5 L48 59.5 Z" fill="#D98A94"/>
  <path d="M48 59.5 V62 M44.5 63 Q48 66 51.5 63" stroke="#9C8478" stroke-width="1.6" stroke-linecap="round"/>'''


def bird_figure():
    return f'''
  <ellipse cx="48" cy="84" rx="26" ry="4" fill="#9CC98F"/>
  <path d="M30 84 C24 66 30 40 48 34 C66 40 72 66 66 84 Z" fill="#F6C94F"/>
  <path d="M60 58 C70 60 74 70 70 78 C64 74 58 68 60 58 Z" fill="#E8B23A"/>
  <circle cx="48" cy="36" r="17" fill="#F6C94F"/>
  <path d="M46 20 C46 14 52 13 53 18" stroke="#E8B23A" stroke-width="3" stroke-linecap="round"/>
  <path d="M43 40 L48 46 L53 40 Z" fill="#E9874A"/>
  <circle cx="41" cy="34" r="2.6" fill="#3A2A22"/>
  <circle cx="55" cy="34" r="2.6" fill="#3A2A22"/>
  <circle cx="37" cy="40" r="3.2" fill="{C['cheek']}" opacity="0.5"/>
  <circle cx="59" cy="40" r="3.2" fill="{C['cheek']}" opacity="0.5"/>
  <path d="M42 84 V90 M54 84 V90" stroke="#E9874A" stroke-width="2.4" stroke-linecap="round"/>'''


def potted_plant_figure():
    return f'''
  <path d="M48 58 C36 58 26 48 27 34 C40 34 48 44 48 58 Z" fill="{C['leaf']}"/>
  <path d="M48 58 C60 58 70 48 69 34 C56 34 48 44 48 58 Z" fill="{C['leaf_dark']}"/>
  <path d="M48 56 C42 46 42 32 48 22 C54 32 54 46 48 56 Z" fill="{C['leaf_light']}"/>
  <path d="M48 52 V28 M46 55 C41 50 35 44 31 38 M50 55 C55 50 61 44 65 38" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M33 62 H63 L59 84 H37 Z" fill="{C['terracotta']}"/>
  <rect x="31" y="58" width="34" height="7" rx="2.5" fill="#C9744A"/>'''


def cactus_figure():
    return f'''
  <path d="M41 70 V34 a7 7 0 0 1 14 0 V70 Z" fill="#5FA86A"/>
  <path d="M41 56 H35 a6 6 0 0 1 -6 -6 V42 a3.5 3.5 0 0 1 7 0 V49 H41 Z" fill="#5FA86A"/>
  <path d="M55 50 H61 a6 6 0 0 0 6 -6 V38 a3.5 3.5 0 0 0 -7 0 V43 H55 Z" fill="#5FA86A"/>
  <path d="M48 32 V66" stroke="#4E9A5C" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M44 40 h1.5 M51 46 h1.5 M44 52 h1.5 M51 58 h1.5 M32 46 h1.5 M62 41 h1.5" stroke="#E9F4E4" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="48" cy="27" r="3.5" fill="#F29E8E"/>
  <path d="M33 70 H63 L59 88 H37 Z" fill="{C['terracotta']}"/>
  <rect x="31" y="66" width="34" height="7" rx="2.5" fill="#C9744A"/>'''


def sunflower_figure():
    petals = ''.join(
        f'<ellipse cx="48" cy="22" rx="5.5" ry="10" fill="#F6C14F" transform="rotate({a} 48 36)"/>'
        for a in range(0, 360, 30)
    )
    return f'''
  <path d="M48 50 V88" stroke="#3F8A4E" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M48 74 C40 74 32 68 31 60 C40 60 47 65 48 74 Z" fill="{C['leaf']}"/>
  <path d="M48 68 C56 68 64 62 65 54 C56 54 49 59 48 68 Z" fill="{C['leaf_dark']}"/>
  {petals}
  <circle cx="48" cy="36" r="10" fill="#8A5A32"/>
  <circle cx="45" cy="33" r="1.4" fill="#6B4426"/><circle cx="51" cy="34" r="1.4" fill="#6B4426"/><circle cx="47" cy="39" r="1.4" fill="#6B4426"/><circle cx="52" cy="39" r="1.2" fill="#6B4426"/>'''


# Dog breeds share the head of `dog_figure`; only coat, ears and markings change.

def dog_head(coat):
    return f'''
  <ellipse cx="48" cy="51" rx="20" ry="20" fill="{coat}"/>'''


def dog_face(muzzle, eye='#3A2A22', mouth='#7A4E36', iris=None):
    eyes = (
        f'''
  <circle cx="39.5" cy="48" r="3.1" fill="{iris}"/>
  <circle cx="56.5" cy="48" r="3.1" fill="{iris}"/>
  <circle cx="39.5" cy="48" r="1.5" fill="{eye}"/>
  <circle cx="56.5" cy="48" r="1.5" fill="{eye}"/>'''
        if iris
        else f'''
  <circle cx="39.5" cy="48" r="2.7" fill="{eye}"/>
  <circle cx="56.5" cy="48" r="2.7" fill="{eye}"/>'''
    )
    return f'''
  <ellipse cx="48" cy="61" rx="11.5" ry="8.5" fill="{muzzle}"/>
  <ellipse cx="48" cy="56.5" rx="4.2" ry="3.2" fill="#3A2A22"/>{eyes}
  <path d="M48 59.5 V62 M43.5 62.5 Q48 66 52.5 62.5" stroke="{mouth}" stroke-width="2" stroke-linecap="round"/>'''


def floppy_ears(fill):
    return f'''
  <path d="M30 34 C19 36 16 55 22 66 C29 65 32 52 35 41 Z" fill="{fill}"/>
  <path d="M66 34 C77 36 80 55 74 66 C67 65 64 52 61 41 Z" fill="{fill}"/>'''


def dog_body(coat, chest):
    return f'''
  <path d="M24 100 C26 82 36 75 48 75 C60 75 70 82 72 100 Z" fill="{coat}"/>
  <path d="M41 75 C44 84 52 84 55 75" fill="{chest}"/>'''


def labrador_figure():
    coat, muzzle = '#E6C48A', '#F5E3C0'
    return (
        dog_body(coat, muzzle)
        + dog_head(coat)
        + floppy_ears('#D2A462')
        + dog_face(muzzle)
    )


def husky_figure():
    coat, white = '#7F8C99', '#F7F7F5'
    return dog_body(coat, white) + f'''
  <path d="M29 42 L31 18 L45 33 Z" fill="{coat}"/>
  <path d="M67 42 L65 18 L51 33 Z" fill="{coat}"/>
  <path d="M32 36 L33 25 L40 32 Z M64 36 L63 25 L56 32 Z" fill="#F2D3D0"/>''' + dog_head(coat) + f'''
  <path d="M48 38 C44 42 41 44 34 46 C30 52 30 62 36 68 C40 71 44 72 48 72 C52 72 56 71 60 68 C66 62 66 52 62 46 C55 44 52 42 48 38 Z" fill="{white}"/>
  <circle cx="39.5" cy="41.5" r="2.4" fill="{white}"/>
  <circle cx="56.5" cy="41.5" r="2.4" fill="{white}"/>''' + dog_face(white, iris='#5A9AD8', mouth='#6E7882')


def boxer_figure():
    coat, white, mask = '#C98544', '#FBF4EA', '#5C4A40'
    return dog_body(coat, white) + f'''
  <path d="M29 42 C26 34 28 27 34 26 C40 26 42 32 40 38 Z" fill="#A66A33"/>
  <path d="M67 42 C70 34 68 27 62 26 C56 26 54 32 56 38 Z" fill="#A66A33"/>''' + dog_head(coat) + f'''
  <path d="M45 32 C46 40 46 46 48 52 C50 46 50 40 51 32 C49 31 47 31 45 32 Z" fill="{white}"/>''' + dog_face(mask, mouth='#CBB8A6')


def caramelo_figure():
    coat, muzzle = '#D99547', '#F6DDB6'
    return dog_body(coat, muzzle) + f'''
  <path d="M29 44 L31 21 L45 33 Z" fill="{coat}"/>
  <path d="M67 44 L65 21 L51 33 Z" fill="{coat}"/>
  <path d="M33 37 L33.5 27 L40 33 Z M63 37 L62.5 27 L56 33 Z" fill="{muzzle}"/>''' + dog_head(coat) + f'''
  <path d="M44 33 C45 40 45 47 48 52 C51 47 51 40 52 33 C49 31.5 47 31.5 44 33 Z" fill="{muzzle}"/>''' + dog_face(muzzle)


# Cat coats share the head of `cat_figure`.

def cat_coat(coat, ear_inner, muzzle, nose, whisker, eye='#3A2A22', iris=None, left_ear=None, right_ear=None, stripes=None, patches=''):
    eyes = (
        f'''
  <ellipse cx="39.5" cy="50" rx="3.2" ry="3.8" fill="{iris}"/>
  <ellipse cx="56.5" cy="50" rx="3.2" ry="3.8" fill="{iris}"/>
  <ellipse cx="39.5" cy="50" rx="1.3" ry="3" fill="{eye}"/>
  <ellipse cx="56.5" cy="50" rx="1.3" ry="3" fill="{eye}"/>'''
        if iris
        else f'''
  <ellipse cx="39.5" cy="50" rx="2.6" ry="3.4" fill="{eye}"/>
  <ellipse cx="56.5" cy="50" rx="2.6" ry="3.4" fill="{eye}"/>'''
    )
    stripe_el = (
        f'''
  <path d="M41 33 C43 37 53 37 55 33 M38 38 C42 42 54 42 58 38" stroke="{stripes}" stroke-width="2.4" stroke-linecap="round"/>'''
        if stripes
        else ''
    )
    return f'''
  <path d="M24 100 C26 82 36 76 48 76 C60 76 70 82 72 100 Z" fill="{coat}"/>
  <path d="M28 46 L30 22 L44 34 Z" fill="{left_ear or coat}"/>
  <path d="M68 46 L66 22 L52 34 Z" fill="{right_ear or coat}"/>
  <path d="M31 40 L32 28 L40 35 Z M65 40 L64 28 L56 35 Z" fill="{ear_inner}"/>
  <ellipse cx="48" cy="52" rx="22" ry="20" fill="{coat}"/>{patches}{stripe_el}
  <ellipse cx="48" cy="61" rx="10" ry="7" fill="{muzzle}"/>
  <path d="M45.5 57 H50.5 L48 60 Z" fill="{nose}"/>{eyes}
  <path d="M48 60 V62 M44 63.5 Q48 66.5 52 63.5 M30 58 H39 M30 63 L39 61 M66 58 H57 M66 63 L57 61" stroke="{whisker}" stroke-width="1.6" stroke-linecap="round"/>'''


def black_cat_figure():
    return cat_coat('#3B3742', '#8C6B78', '#56505E', '#D6929C', '#C9C3D0', eye='#1E1A20', iris='#E2C84E')


def white_cat_figure():
    return cat_coat('#F5F1EB', '#F4C3C8', '#FFFFFF', '#E39AA2', '#B3A69C')


def tricolor_cat_figure():
    patches = '''
  <path d="M27 48 C27 39 32 34 39 32.5 C42 36 43 41 41 46 C37 47 32 48 27 48 Z" fill="#E59A52"/>
  <path d="M69 50 C69 41 64 35 56 32.5 C53 37 54 43 57 47 C61 48 65 49 69 50 Z" fill="#3B3742"/>'''
    return cat_coat('#F7F2EA', '#F4C3C8', '#FFFFFF', '#D98A94', '#A8968A', left_ear='#E59A52', right_ear='#3B3742', patches=patches)


def fish_figure():
    return f'''
  <path d="M0 64 C20 58 30 70 48 64 C66 58 76 70 96 64 V100 H0 Z" fill="#B9DDF2"/>
  <path d="M66 46 L84 32 C86 42 86 54 84 64 Z" fill="#E9874A"/>
  <ellipse cx="46" cy="48" rx="24" ry="17" fill="#F4A259"/>
  <path d="M38 32 C44 24 54 25 58 33 Z" fill="#E9874A"/>
  <path d="M42 64 C46 70 52 70 54 63 Z" fill="#E9874A"/>
  <path d="M50 33 C55 40 55 56 50 63" stroke="#FBE3C8" stroke-width="3" stroke-linecap="round"/>
  <circle cx="33" cy="45" r="3.4" fill="#FFFFFF"/>
  <circle cx="33" cy="45" r="2" fill="#3A2A22"/>
  <circle cx="30" cy="52" r="3" fill="{C['cheek']}" opacity="0.5"/>
  <path d="M23 52 Q26 55 29 53" stroke="#A9573F" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="18" cy="34" r="3" stroke="#8FC5E0" stroke-width="1.6"/>
  <circle cx="14" cy="24" r="2" stroke="#8FC5E0" stroke-width="1.4"/>
  <circle cx="22" cy="78" r="2" fill="#FFFFFF" opacity="0.6"/>
  <circle cx="70" cy="82" r="2.5" fill="#FFFFFF" opacity="0.6"/>'''


def hamster_figure():
    return f'''
  <circle cx="30" cy="34" r="8" fill="#D9984D"/>
  <circle cx="66" cy="34" r="8" fill="#D9984D"/>
  <circle cx="30" cy="34" r="4.5" fill="#F4C3C8"/>
  <circle cx="66" cy="34" r="4.5" fill="#F4C3C8"/>
  <path d="M18 100 C16 66 28 36 48 36 C68 36 80 66 78 100 Z" fill="#E4A85E"/>
  <path d="M28 100 C26 76 36 58 48 58 C60 58 70 76 68 100 Z" fill="#FAEBD7"/>
  <ellipse cx="48" cy="56" rx="17" ry="12" fill="#FAEBD7"/>
  <circle cx="30" cy="62" r="9" fill="#FAEBD7"/>
  <circle cx="66" cy="62" r="9" fill="#FAEBD7"/>
  <circle cx="39" cy="50" r="2.7" fill="#3A2A22"/>
  <circle cx="57" cy="50" r="2.7" fill="#3A2A22"/>
  <circle cx="32" cy="60" r="3.4" fill="{C['cheek']}" opacity="0.5"/>
  <circle cx="64" cy="60" r="3.4" fill="{C['cheek']}" opacity="0.5"/>
  <ellipse cx="48" cy="56" rx="2.6" ry="2" fill="#D98A94"/>
  <path d="M48 58 V60 M45 61 Q48 63.5 51 61" stroke="#9C7A62" stroke-width="1.6" stroke-linecap="round"/>
  <ellipse cx="48" cy="74" rx="6" ry="7.5" fill="#C9874A"/>
  <path d="M48 67.5 V80" stroke="#A86E3A" stroke-width="1.2"/>
  <ellipse cx="41" cy="74" rx="3.5" ry="3" fill="#F4C3C8"/>
  <ellipse cx="55" cy="74" rx="3.5" ry="3" fill="#F4C3C8"/>'''


def turtle_figure():
    return f'''
  <ellipse cx="48" cy="82" rx="30" ry="4" fill="#9CC98F"/>
  <ellipse cx="30" cy="81" rx="6" ry="5" fill="#9CCB7E"/>
  <ellipse cx="72" cy="81" rx="6" ry="5" fill="#9CCB7E"/>
  <path d="M22 58 C24 64 30 66 34 64 L32 54 Z" fill="#9CCB7E"/>
  <circle cx="20" cy="52" r="10" fill="#9CCB7E"/>
  <path d="M24 78 C22 56 34 40 52 40 C70 40 82 56 80 78 Z" fill="#6FA567"/>
  <path d="M52 44 L62 50 L60 62 L48 66 L38 60 L40 49 Z" fill="#5C9254" stroke="#4E8049" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M40 49 L32 46 M62 50 L71 50 M60 62 L68 72 M48 66 L48 77 M38 60 L29 70" stroke="#4E8049" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M22 78 H82" stroke="#D9C78A" stroke-width="4" stroke-linecap="round"/>
  <circle cx="17" cy="49" r="2.4" fill="#3A2A22"/>
  <circle cx="23" cy="55" r="2.6" fill="{C['cheek']}" opacity="0.5"/>
  <path d="M12 55 Q15 58 19 56.5" stroke="#4E8049" stroke-width="1.6" stroke-linecap="round"/>'''


def lizard_figure():
    return f'''
  <path d="M48 66 C48 80 60 86 70 82 C78 78 78 70 72 68 C68 67 66 72 70 74" stroke="#5DAA5E" stroke-width="6" stroke-linecap="round"/>
  <path d="M34 46 L22 40 M62 46 L74 40 M36 64 L24 72 M60 64 L72 72" stroke="#5DAA5E" stroke-width="5" stroke-linecap="round"/>
  <circle cx="21" cy="39" r="3" fill="#5DAA5E"/><circle cx="75" cy="39" r="3" fill="#5DAA5E"/>
  <circle cx="23" cy="73" r="3" fill="#5DAA5E"/><circle cx="73" cy="73" r="3" fill="#5DAA5E"/>
  <ellipse cx="48" cy="56" rx="13" ry="16" fill="#6DBB6A"/>
  <ellipse cx="48" cy="30" rx="15" ry="13" fill="#6DBB6A"/>
  <circle cx="40" cy="58" r="2" fill="#F6C14F"/><circle cx="54" cy="52" r="2.4" fill="#F6C14F"/><circle cx="50" cy="64" r="1.8" fill="#F6C14F"/>
  <circle cx="40" cy="25" r="5.4" fill="#FFFFFF"/>
  <circle cx="56" cy="25" r="5.4" fill="#FFFFFF"/>
  <circle cx="40.5" cy="25.5" r="3" fill="#3A2A22"/>
  <circle cx="55.5" cy="25.5" r="3" fill="#3A2A22"/>
  <circle cx="37" cy="33" r="2.8" fill="{C['cheek']}" opacity="0.5"/>
  <circle cx="59" cy="33" r="2.8" fill="{C['cheek']}" opacity="0.5"/>
  <path d="M42 35 Q48 39 54 35" stroke="#3F7F45" stroke-width="2" stroke-linecap="round"/>'''


def snake_figure():
    return f'''
  <ellipse cx="48" cy="80" rx="28" ry="9" fill="#5FA86A"/>
  <ellipse cx="48" cy="77" rx="26" ry="8" fill="#77BD7F"/>
  <ellipse cx="48" cy="68" rx="20" ry="7.5" fill="#5FA86A"/>
  <ellipse cx="48" cy="65.5" rx="18" ry="6.5" fill="#77BD7F"/>
  <path d="M60 64 C66 58 64 50 56 46" stroke="#77BD7F" stroke-width="10" stroke-linecap="round"/>
  <path d="M37 72 l3 3 M47 73 l3 3 M57 72 l3 3 M41 63 l3 3 M52 63 l3 3" stroke="#4E9A5C" stroke-width="1.8" stroke-linecap="round"/>
  <ellipse cx="46" cy="38" rx="15" ry="12" fill="#77BD7F"/>
  <path d="M46 50 V56 M46 56 L43 60 M46 56 L49 60" stroke="#D9574A" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="40" cy="35" r="2.7" fill="#3A2A22"/>
  <circle cx="52" cy="35" r="2.7" fill="#3A2A22"/>
  <circle cx="36" cy="42" r="2.8" fill="{C['cheek']}" opacity="0.5"/>
  <circle cx="56" cy="42" r="2.8" fill="{C['cheek']}" opacity="0.5"/>
  <path d="M42 44 Q46 47 50 44" stroke="#3F7F45" stroke-width="1.8" stroke-linecap="round"/>'''


def robot_figure():
    return f'''
  <path d="M48 22 V14" stroke="#8496A8" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="48" cy="12" r="4" fill="#F29E8E"/>
  <rect x="22" y="80" width="52" height="24" rx="10" fill="#A9B8C6"/>
  <rect x="42" y="72" width="12" height="10" rx="3" fill="#8496A8"/>
  <rect x="16" y="38" width="8" height="18" rx="4" fill="#8496A8"/>
  <rect x="72" y="38" width="8" height="18" rx="4" fill="#8496A8"/>
  <rect x="22" y="22" width="52" height="52" rx="16" fill="#C7D3DE"/>
  <rect x="29" y="32" width="38" height="30" rx="10" fill="#2F4A5E"/>
  <circle cx="40" cy="45" r="4" fill="#8FE3D6"/>
  <circle cx="56" cy="45" r="4" fill="#8FE3D6"/>
  <path d="M42 53 Q48 57 54 53" stroke="#8FE3D6" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="48" cy="90" r="4" fill="#F6C14F"/>'''


def pot(y=70, fill=C['terracotta'], rim='#C9744A'):
    return f'''
  <path d="M33 {y} H63 L59 {y + 18} H37 Z" fill="{fill}"/>
  <rect x="31" y="{y - 4}" width="34" height="7" rx="2.5" fill="{rim}"/>'''


def succulent_figure():
    def petal(angle, length, width, fill):
        return (
            f'<path d="M48 62 C{48 - width} {62 - length * 0.5} {48 - width * 0.4} {62 - length} 48 {62 - length} '
            f'C{48 + width * 0.4} {62 - length} {48 + width} {62 - length * 0.5} 48 62 Z" '
            f'fill="{fill}" transform="rotate({angle} 48 62)"/>'
        )

    outer = ''.join(petal(a, 26, 9, '#6FAF94') for a in (-75, -45, -15, 15, 45, 75))
    inner = ''.join(petal(a, 20, 7, '#8CC6AA') for a in (-55, -25, 0, 25, 55))
    core = ''.join(petal(a, 12, 5, '#B5DDC6') for a in (-30, 0, 30))
    return f'''
  {outer}{inner}{core}
  <path d="M28 52 l2 2 M68 52 l-2 2" stroke="#F29E8E" stroke-width="2" stroke-linecap="round"/>''' + pot(66)


def orchid_figure():
    def flower(x, y, s):
        petals = ''.join(
            f'<ellipse cx="{x}" cy="{y - 6 * s}" rx="{3.6 * s}" ry="{6 * s}" fill="#E8A0C8" transform="rotate({a} {x} {y})"/>'
            for a in (0, 72, 144, 216, 288)
        )
        return f'{petals}<circle cx="{x}" cy="{y}" r="{3 * s}" fill="#F6C14F"/><circle cx="{x}" cy="{y + 1 * s}" r="{1.6 * s}" fill="#C9578E"/>'

    return f'''
  <path d="M46 66 C44 48 48 32 60 22" stroke="#4E8A4E" stroke-width="2.4" stroke-linecap="round"/>
  {flower(62, 24, 1.0)}
  {flower(50, 34, 1.15)}
  {flower(36, 46, 1.25)}
  <path d="M48 66 C36 66 24 60 22 52 C32 50 44 56 48 66 Z" fill="{C['leaf']}"/>
  <path d="M48 66 C60 66 72 60 74 52 C64 50 52 56 48 66 Z" fill="{C['leaf_dark']}"/>''' + pot(70, '#E9E4DD', '#D5CEC5')


def fern_figure():
    def frond(x0, y0, x1, y1, cx, cy, fill):
        leaflets = ''
        for i in range(1, 8):
            t = i / 8
            # point on the quadratic curve and its tangent
            px = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1
            py = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1
            tx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx)
            ty = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy)
            angle = math.degrees(math.atan2(ty, tx))
            size = 6.5 * (1 - t * 0.6)
            for side in (-1, 1):
                leaflets += (
                    f'<ellipse cx="{px:.1f}" cy="{py:.1f}" rx="{size:.1f}" ry="{size * 0.42:.1f}" fill="{fill}" '
                    f'transform="rotate({angle + side * 60:.0f} {px:.1f} {py:.1f}) translate({size * 0.8:.1f} 0)"/>'
                )
        return f'<path d="M{x0} {y0} Q{cx} {cy} {x1} {y1}" stroke="#3F8A4E" stroke-width="1.8" stroke-linecap="round"/>{leaflets}'

    return f'''
  {frond(46, 66, 16, 64, 24, 38, C['leaf'])}
  {frond(50, 66, 80, 64, 72, 38, C['leaf'])}
  {frond(46, 66, 30, 26, 36, 40, C['leaf_dark'])}
  {frond(50, 66, 66, 26, 60, 40, C['leaf_dark'])}
  {frond(48, 66, 49, 18, 46, 40, C['leaf_light'])}''' + pot(70)


CHILD_BG, ADULT_BG, ELDERLY_BG, PET_BG, PLANT_BG ='#FCE3A6', '#D6E6FB', '#EADCF5', '#D3EDD8', '#DCF0D3'

AVATARS = {
    'child': (CHILD_BG, child_figure),
    'girl': (CHILD_BG, girl_figure),
    'baby': (CHILD_BG, baby_figure),
    'adult': (ADULT_BG, adult_figure),
    'man': (ADULT_BG, man_figure),
    'elderly': (ELDERLY_BG, elderly_figure),
    'elderly-man': (ELDERLY_BG, elderly_man_figure),
    'pet': (PET_BG, dog_figure),
    'labrador': (PET_BG, labrador_figure),
    'husky': (PET_BG, husky_figure),
    'boxer': (PET_BG, boxer_figure),
    'caramelo': (PET_BG, caramelo_figure),
    'cat': (PET_BG, cat_figure),
    'black-cat': (PET_BG, black_cat_figure),
    'white-cat': (PET_BG, white_cat_figure),
    'tricolor-cat': (PET_BG, tricolor_cat_figure),
    'rabbit': (PET_BG, rabbit_figure),
    'bird': (PET_BG, bird_figure),
    'fish': (PET_BG, fish_figure),
    'hamster': (PET_BG, hamster_figure),
    'turtle': (PET_BG, turtle_figure),
    'lizard': (PET_BG, lizard_figure),
    'snake': (PET_BG, snake_figure),
    'robot': (PET_BG, robot_figure),
    'plant': (PLANT_BG, plant_figure),
    'potted-plant': (PLANT_BG, potted_plant_figure),
    'cactus': (PLANT_BG, cactus_figure),
    'sunflower': (PLANT_BG, sunflower_figure),
    'succulent': (PLANT_BG, succulent_figure),
    'orchid': (PLANT_BG, orchid_figure),
    'fern': (PLANT_BG, fern_figure),
}


# People avatars come in every skin tone (`SKIN_TONE_VALUES` in
# domain/types.ts). The figures above are drawn in the "light" tone; the
# other tones swap those skin colors, plus the mouth, eyes and glasses
# where they would otherwise lose contrast.
# Keep the `base` values in sync with the swatches in theme/skin-tones.ts.
PEOPLE = ['child', 'girl', 'baby', 'adult', 'man', 'elderly', 'elderly-man']
LIGHT_SKIN = ['#F6C9A0', '#F2C29E', '#EDBB94', '#F3C7A6']
LIGHT_SHADOW = ['#E8AE85', '#E9B48E']
SKIN_TONES = {
    'light': None,
    'medium-light': {'base': '#E3AD82', 'shadow': '#CC9468', 'mouth': '#93492F'},
    'medium': {'base': '#C68B5E', 'shadow': '#AD744A', 'mouth': '#7A3626'},
    'medium-dark': {'base': '#9C6640', 'shadow': '#83522F', 'mouth': '#E3A08C', 'eye': '#1C110C', 'glasses': '#DCCBC0'},
    'dark': {'base': '#6B432C', 'shadow': '#57341F', 'mouth': '#E3A08C', 'eye': '#1C110C', 'glasses': '#DCCBC0'},
}
GLASSES = '#8A6A5A'


def tone_figure(fig, tone):
    palette = SKIN_TONES[tone]
    if palette is None:
        return fig
    for color in LIGHT_SKIN:
        fig = fig.replace(color, palette['base'])
    for color in LIGHT_SHADOW:
        fig = fig.replace(color, palette['shadow'])
    fig = fig.replace(C['mouth'], palette['mouth'])
    # On the darker tones the default eyes and glasses frames would blend in.
    if 'eye' in palette:
        fig = fig.replace(C['eye'], palette['eye']).replace(GLASSES, palette['glasses'])
    return fig


def avatar_group(kind, uid, tone='light'):
    bg, fig = AVATARS[kind]
    return f'''<defs><clipPath id="clip-{uid}"><circle cx="48" cy="48" r="48"/></clipPath></defs>
<circle cx="48" cy="48" r="48" fill="{bg}"/>
<g clip-path="url(#clip-{uid})">{tone_figure(fig(), tone)}
</g>'''


def avatar_file(kind, tone='light'):
    return kind if tone == 'light' else f'{kind}-{tone}'


for kind in AVATARS:
    tones = SKIN_TONES if kind in PEOPLE else ['light']
    for tone in tones:
        name = avatar_file(kind, tone)
        write(f'avatars/{name}.svg', svg('0 0 96 96', avatar_group(kind, name, tone), 96, 96))


def component_name(file):
    return ''.join(part.capitalize() for part in file.split('-')) + 'Avatar'


# The app imports avatars through this generated map, so adding an avatar
# or a skin tone here never means hand-writing dozens of imports.
imports, entries = [], []
for kind in AVATARS:
    if kind in PEOPLE:
        tones = []
        for tone in SKIN_TONES:
            file = avatar_file(kind, tone)
            imports.append(f"import {component_name(file)} from './{file}.svg';")
            tones.append(f"    '{tone}': {component_name(file)},")
        entries.append(f"  'svg:{kind}': {{\n" + '\n'.join(tones) + '\n  },')
    else:
        imports.append(f"import {component_name(kind)} from './{kind}.svg';")
        entries.append(f"  'svg:{kind}': {component_name(kind)},")

write('avatars/index.ts', f'''// Generated by scripts/generate-svg-assets.py. Do not edit by hand.
import type {{ FC }} from 'react';
import type {{ SvgProps }} from 'react-native-svg';

import type {{ SkinTone }} from '@/domain/types';

{chr(10).join(imports)}

/** People avatars have one illustration per skin tone; the others have one. */
export const AVATAR_ART: Record<string, FC<SvgProps> | Record<SkinTone, FC<SvgProps>>> = {{
{chr(10).join(entries)}
}};
''')


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
    'leaf': '<path d="M5 19C5 10 11 4.5 19.5 4.5 19.5 13 14 19 5 19z"/><path d="M5 19 14 10"/>',
    'minus': '<path d="M6 12h12"/>',
    'package': '<path d="m12 3.5 8 4v9l-8 4-8-4v-9z"/><path d="m4 7.5 8 4 8-4M12 11.5v9"/>',
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
    'icons/dot.svg',
    svg('0 0 24 24', '<circle cx="12" cy="12" r="5" fill="currentColor"/>', 24, 24),
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
