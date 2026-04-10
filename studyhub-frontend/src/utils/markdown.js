export const parseMarkdown = (md) => {
  if (!md) return '';
  return md
    .replace(/^# (.+)/gm,  '<h1 style="font-family:\'Syne\',sans-serif;font-size:24px;font-weight:900;margin:20px 0 10px;color:#f0f0f4">$1</h1>')
    .replace(/^## (.+)/gm, '<h2 style="font-family:\'Syne\',sans-serif;font-size:18px;font-weight:800;margin:16px 0 7px;color:#ddd">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#38bdf8;font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#2dd4bf;font-style:italic">$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(200,241,53,.1);color:#38bdf8;padding:1px 6px;border-radius:4px;font-family:\'JetBrains Mono\',monospace;font-size:12px">$1</code>')
    .replace(/^> (.+)/gm, '<blockquote style="border-left:3px solid #38bdf8;padding:8px 14px;margin:10px 0;background:rgba(200,241,53,.04);border-radius:0 7px 7px 0;color:#bbb;font-style:italic">$1</blockquote>')
    .replace(/^- (.+)/gm, '<li style="margin:4px 0;color:#aaa">$1</li>')
    .replace(/\|(.+)\|/g, row => `<tr>${row.split('|').filter(Boolean).map(c=>`<td style="padding:6px 12px;font-size:12px;color:#aaa;border-bottom:1px solid rgba(255,255,255,.05)">${c.trim()}</td>`).join('')}</tr>`)
    .split('\n').map(line => {
      if (/<(h[12]|blockquote|li|tr)/.test(line)) return line;
      if (!line.trim()) return '<br/>';
      return `<p style="color:#888;margin:5px 0;line-height:1.7;font-size:13px">${line}</p>`;
    }).join('\n')
    .replace(/(<tr>[\s\S]*?<\/tr>)+/g, m => `<table style="border-collapse:collapse;margin:12px 0;width:100%;background:rgba(255,255,255,.02);border-radius:7px;overflow:hidden">${m}</table>`)
    .replace(/(<li>[\s\S]*?<\/li>)+/g, m => `<ul style="margin:8px 0 8px 18px;list-style:disc">${m}</ul>`);
};
