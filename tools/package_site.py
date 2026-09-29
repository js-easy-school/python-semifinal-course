"""Package only public website assets; never copy progress, logs or local backups."""
import shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
site=root/'_site'
site.mkdir(exist_ok=True)
for name in ('index.html','style.css','theme.js','favicon.svg','curriculum.json','worker.js'):
    shutil.copy2(root/name,site/name)
(site/'dist').mkdir(exist_ok=True)
shutil.copy2(root/'dist/app.js',site/'dist/app.js')
shutil.copytree(root/'vendor',site/'vendor',dirs_exist_ok=True)
(site/'.nojekyll').write_text('',encoding='utf-8')
print('Packaged public website assets in _site')
