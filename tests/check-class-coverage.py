#!/usr/bin/env python3
"""Checks that every class used in the HTML exists in a given stylesheet.

Tailwind escapes special characters when it writes selectors, so a class like
`lg:pl-64` appears as `.lg\:pl-64` and `gap-1.5` as `.gap-1\.5`. Matching has to
account for that or every responsive or fractional utility looks missing.
"""
import re
import sys
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets/css/emon-material.min.css')

css = open(CSS).read()


def css_escape(name: str) -> str:
    """Mimic Tailwind's selector escaping for one class name."""
    out = []
    for ch in name:
        if ch.isalnum() or ch in '-_':
            out.append(ch)
        else:
            out.append('\\' + ch)
    return ''.join(out)


def has(cls: str) -> bool:
    needle = '.' + css_escape(cls)
    # Scan every occurrence: the first `.border` in the file is likely
    # `.border-collapse`, which is a different class.
    start = 0
    while True:
        i = css.find(needle, start)
        if i == -1:
            return False
        nxt = css[i + len(needle):i + len(needle) + 1]
        if nxt == '' or nxt in ',{ :[>+~':
            return True
        start = i + 1


# Tailwind marker classes only exist as selectors in other rules
# (`.group:hover .group-hover\:scale-110`), never as a rule of their own.
MARKERS = {'group', 'peer', 'light', 'dark'}


def page_defined(path: str, source: str) -> set:
    """Classes the page styles itself in an inline <style> block."""
    out = set()
    for m in re.finditer(r'<style[^>]*>(.*?)</style>', source, re.S):
        for c in re.findall(r'\.([A-Za-z_][\w-]*)', m.group(1)):
            out.add(c)
    return out


def js_hooks() -> set:
    """Classes that exist only as JS selectors and are never styled."""
    out = set()
    sources = [open(f).read() for f in glob.glob(os.path.join(ROOT, '*.html'))]
    sources += [open(f).read() for f in glob.glob(os.path.join(ROOT, 'assets/js/*.js'))]
    for src in sources:
        for m in re.finditer(r'(?:querySelectorAll|querySelector|closest|matches)\(\s*[\'"]\.([a-z][a-z0-9-]{3,})', src):
            out.add(m.group(1))
    return out


HOOKS = js_hooks()

total = 0
missing = {}
for f in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    s = open(f).read()
    classes = set()
    for m in re.finditer(r'class="([^"]+)"', s):
        classes.update(c for c in m.group(1).split() if c)
    own = page_defined(f, s)
    miss = sorted(c for c in classes
                  if not has(c) and c not in MARKERS and c not in own and c not in HOOKS)
    total += len(classes)
    for c in miss:
        missing.setdefault(c, []).append(os.path.basename(f))
    if miss:
        print(f"{os.path.basename(f)}: {len(miss)}/{len(classes)} missing")

print(f"\ntotal class checked: {total} | unique missing: {len(missing)}")
for k, v in list(missing.items())[:30]:
    print("   ", k, "<-", ",".join(v[:3]))

# Fragments of inline JavaScript (template literals, ternaries) are not class
# attributes; a `class="..."` inside a script body can capture them.
def is_js_artifact(name: str) -> bool:
    return bool(re.match(r"^[$'{?:?]", name) or "'" in name or '}' in name or '"' in name)


real_missing = {k: v for k, v in missing.items() if not is_js_artifact(k)}
if real_missing:
    print("\n::error::classes referenced in markup but absent from the compiled CSS")
    for k, v in real_missing.items():
        print("   ", k, "<-", ",".join(v[:3]))
    sys.exit(1)
print("all class attributes resolve in the compiled CSS")
sys.exit(0)
