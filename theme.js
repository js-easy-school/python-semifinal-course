// Applies the saved colour theme before the first paint; loaded synchronously from <head>.
try{const theme=localStorage.getItem('python-semifinal.theme');if(theme)document.documentElement.dataset.theme=theme;}catch{}
