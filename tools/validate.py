#!/usr/bin/env python3
"""Validate repo assets that don't need a browser build:
   - every *.json parses
   - every *.html under pages/ and theme/ is well-formed (tags balanced)
Run: python3 tools/validate.py   (exit 1 on any failure)
"""
import glob, json, sys
from html.parser import HTMLParser

VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}
fails = 0

def fail(msg):
    global fails; fails += 1; print("  FAIL", msg)

# JSON
for f in glob.glob("**/*.json", recursive=True):
    if "/node_modules/" in f or f.startswith(".cache"): continue
    try:
        json.load(open(f, encoding="utf-8")); print("  ok   json", f)
    except Exception as e:
        fail(f"json {f}: {e}")

# HTML well-formedness
class Checker(HTMLParser):
    def __init__(s): super().__init__(convert_charrefs=True); s.stack=[]
    def handle_starttag(s,t,a):
        if t not in VOID: s.stack.append(t)
    def handle_endtag(s,t):
        if t in VOID: return
        if s.stack and s.stack[-1]==t: s.stack.pop()
        elif t in s.stack:
            while s.stack and s.stack.pop()!=t: pass

for f in glob.glob("pages/**/*.html", recursive=True) + glob.glob("theme/**/*.html", recursive=True):
    p = Checker()
    try:
        p.feed(open(f, encoding="utf-8").read())
    except Exception as e:
        fail(f"html {f}: parse error {e}"); continue
    left = [x for x in p.stack if x not in ("html","body")]
    if left: fail(f"html {f}: unclosed tags {left}")
    else: print("  ok   html", f)

print(f"\nvalidate: {'OK' if not fails else str(fails)+' FAILED'}")
sys.exit(1 if fails else 0)
