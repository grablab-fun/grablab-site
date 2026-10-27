# Builds docs/pitch/anatomy.html: the anatomy 3D viewer as a standalone page under docs/ (served even while the site is in maintenance).
# JS is bundled with esbuild because root-level .js files are redirected to /maintenance without the preview cookie; /assets/ is not.
import os, re, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.abspath(os.path.join(HERE, "..", ".."))
B = os.path.join(HERE, "_build"); os.makedirs(B, exist_ok=True)
src = open(os.path.join(SITE, "anatomy.js"), encoding="utf-8").read()
src = re.sub(r'from "\./anatomy-model\.js\?v=\d+"', 'from "./anatomy-model.js"', src).replace('"./assets/vendor/three.module.min.js"', '"./three.module.min.js"')
open(os.path.join(B, "anatomy.js"), "w", encoding="utf-8", newline="\n").write(src)
shutil.copy(os.path.join(SITE, "anatomy-model.js"), os.path.join(B, "anatomy-model.js"))
shutil.copy(os.path.join(SITE, "assets", "vendor", "three.module.min.js"), os.path.join(B, "three.module.min.js"))
out = os.path.join(B, "anatomy.bundle.js")
r = subprocess.run(["npx", "--yes", "esbuild", os.path.join(B, "anatomy.js"), "--bundle", "--format=iife", "--minify", "--target=es2020", "--log-level=warning", "--outfile=" + out], shell=True, capture_output=True, text=True)
if r.returncode: print(r.stderr); sys.exit(1)
js = open(out, encoding="utf-8").read()
js = re.sub(r'''(["'`])\.?/?(assets/)''', r'\1/\2', js)
open(os.path.join(HERE, "anatomy.bundle.js"), "w", encoding="utf-8", newline="\n").write(js)
css = "\n".join(open(os.path.join(SITE, f), encoding="utf-8").read() for f in ["styles.css", "pages.css", "sub.css", "anatomy.css"])
css = re.sub(r"url\((['\"]?)\.?/?assets/", r"url(\1/assets/", css)
open(os.path.join(HERE, "anatomy.css"), "w", encoding="utf-8", newline="\n").write(css)
html = open(os.path.join(SITE, "anatomy.html"), encoding="utf-8").read()
stage = re.search(r'<section class="an" id="anatomy">.*?</section>', html, re.S).group(0)
stage = stage.replace('src="assets/', 'src="/assets/').replace('href="lab.html"', 'href="https://grablab.fun/lab"')
page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Grablab, Prototype 01 in 3D</title><meta name="robots" content="noindex" />
<link rel="icon" type="image/png" href="/assets/brand/mark-chrome-256.png?v=fav2" />
<link rel="stylesheet" href="/assets/fonts/fonts.css?v=1" /><link rel="stylesheet" href="anatomy.css?v={{V}}" />
<style>html{{background:#050918;overflow:hidden}} body{{background:transparent;overflow:hidden}} .an{{min-height:100vh}} body.ui-min .an-head{{display:none}} body.ui-min .an-bar{{bottom:18px}} @media(min-width:981px){{body.ui-min .an-card{{top:auto!important;bottom:96px!important;transform:none!important;left:clamp(24px,6vw,120px)!important}}}} body.ui-min .grain{{display:block!important}}</style>
</head><body data-page="anatomy" class="ui-min page-in">
<div class="page-atmosphere" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>
<main>{stage}</main>
<script src="anatomy.bundle.js?v={{V}}"></script>
</body></html>'''
import time; v = time.strftime("%m%d%H%M")
open(os.path.join(HERE, "anatomy.html"), "w", encoding="utf-8", newline="\n").write(page.replace("{V}", v))
print("ok", len(js)//1024, "KB js,", len(css)//1024, "KB css, v", v)
