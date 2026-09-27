const fs = require('fs');
let code = fs.readFileSync('src/app.ts', 'utf8');

const perfLogBlock = `// ─── Performance ─────────────────────────────────
app.use(compression());

// ─── Logging ─────────────────────────────────────
app.use(morgan(morganFormat));
`;

// Remove it from the bottom
code = code.replace(perfLogBlock, '');
code = code.replace(/\/\/ ─── Performance ─────────────────────────────────\r?\napp\.use\(compression\(\)\);\r?\n\r?\n\/\/ ─── Logging ─────────────────────────────────────\r?\napp\.use\(morgan\(morganFormat\)\);\r?\n\r?\n/g, '');


// Insert it before Parsing & Sessions
code = code.replace(
  '// ─── Parsing & Sessions ──────────────────────────',
  perfLogBlock + '\n// ─── Parsing & Sessions ──────────────────────────'
);

fs.writeFileSync('src/app.ts', code);
console.log('Fixed app.ts');
