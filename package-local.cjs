const fs=require('fs');
let html=fs.readFileSync('index.html','utf8');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+fs.readFileSync('style.css','utf8')+'</style>');
for(const file of ['p5.min.js','sketch.js'])html=html.replace(`<script src="${file}"></script>`,()=>'<script>'+fs.readFileSync(file,'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
const hasFlowchart=html.includes('id="flowchart-preview"');
if(hasFlowchart){
const flowchart=fs.readFileSync('flowchart-hukum-hooke.png').toString('base64');
html=html.replace('src="flowchart-hukum-hooke.png"',()=>`src="data:image/png;base64,${flowchart}"`);
// A Blob URL lets the standalone HTML open its embedded image in a new tab.
html=html.replace(/<\/body>\s*<\/html>\s*$/,()=>`<script>
const preview=document.getElementById('flowchart-preview');
const bytes=Uint8Array.from(atob(preview.src.split(',')[1]),c=>c.charCodeAt(0));
document.getElementById('flowchart-link').href=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
</script></body></html>`);
}
// Check the scripts as the HTML parser will see them, not only the source files.
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)];
if(scripts.length!==(hasFlowchart?3:2))throw new Error('Jumlah skrip HTML mandiri tidak sesuai.');
for(const [i,script] of scripts.entries())new (require('vm').Script)(script[1],{filename:`bundled-script-${i}.js`});
fs.writeFileSync('simulasi-pegas.html',html);
console.log('HTML mandiri siap, '+html.length+' karakter.');
