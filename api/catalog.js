// GET/POST /api/catalog — the built-in catalog, merged with whatever was uploaded or hidden
// through the admin page. Uploads live in Vercel Blob, never on the (read-only) filesystem.
const { readOverrides } = require('./_store');

// The built-in curriculum — kept in sync with the exam files already linked on the main site
// (see data/catalog.json). Edit here (and there) if a course name or file changes.
const SEED = [
  { id:'b1', year:'year1', sem:1, subject:'כימיה', name:'כימיה כללית ואורגנית — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9B%D7%99%D7%9E%D7%99%D7%94_%D7%9B%D7%9C%D7%9C%D7%99%D7%AA_%D7%95%D7%90%D7%95%D7%A8%D7%92%D7%A0%D7%99%D7%AA_%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b2', year:'year1', sem:1, subject:'ביולוגיה', name:'ביולוגיה של התא — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%91%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94_%D7%A9%D7%9C_%D7%94%D7%AA%D7%90_%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b3', year:'year1', sem:1, subject:'אפידמיולוגיה חלק א׳', name:'אפידמיולוגיה א׳ — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%90%D7%A4%D7%99%D7%93%D7%9E%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94_%D7%90_%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b4', year:'year1', sem:1, subject:'אנטומיה כללית', name:'אנטומיה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%90%D7%A0%D7%98%D7%95%D7%9E%D7%99%D7%94_%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b5', year:'year1', sem:1, subject:'EMT', name:'EMT טראומה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F_EMT_%D7%98%D7%A8%D7%90%D7%95%D7%9E%D7%94_%D7%9E%D7%97%D7%96%D7%95%D7%A8_29.html', builtin:true },
  { id:'b6', year:'year1', sem:1, subject:'EMT', name:'EMT — מערכת תרגול', type:'מבחן', status:'ready', url:'EMT_%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b7', year:'year1', sem:1, subject:'היסטולוגיה ופתולוגיה', name:'היסטולוגיה ופתולוגיה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F_%D7%94%D7%99%D7%A1%D7%98%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94_%D7%A4%D7%AA%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94.html', builtin:true },
  { id:'b8', year:'year1', sem:1, subject:'מיקרוביולוגיה, אימונולוגיה ווירולוגיה', name:'מיקרוביולוגיה, אימונולוגיה ווירולוגיה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F%20%D7%AA%D7%A8%D7%92%D7%95%D7%9C%20-%20%D7%9E%D7%99%D7%A7%D7%A8%D7%95%D7%91%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%90%D7%99%D7%9E%D7%95%D7%A0%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20%D7%95%D7%95%D7%99%D7%A8%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94.html', builtin:true },
  { id:'b9', year:'year1', sem:1, subject:'המטולוגיה', name:'המערכת ההמטולוגית — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F_%D7%94%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA_%D7%94%D7%94%D7%9E%D7%98%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%AA.html', builtin:true },
  { id:'b10', year:'year1', sem:1, subject:'פרמקולוגיה', name:'פרמקולוגיה כללית — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F%20%D7%AA%D7%A8%D7%92%D7%95%D7%9C%20%D7%A4%D7%A8%D7%9E%D7%A7%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94%20-%20%D7%9E%D7%97%D7%96%D7%95%D7%A8%2029.html', builtin:true },
  { id:'b11', year:'year1', sem:2, subject:'קרדיולוגיה', name:'מערכת הלב וכלי הדם — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA_%D7%94%D7%9C%D7%91_%D7%95%D7%9B%D7%9C%D7%99_%D7%94%D7%93%D7%9D_%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b12', year:'year1', sem:2, subject:'נשימה', name:'מערכת הנשימה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA_%D7%94%D7%A0%D7%A9%D7%99%D7%9E%D7%94_%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b13', year:'year1', sem:2, subject:'ביוכימיה', name:'ביוכימיה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%91%D7%99%D7%95%D7%9B%D7%99%D7%9E%D7%99%D7%94_%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b14', year:'year1', sem:2, subject:'ביוכימיה', name:'השחזור האמיתי — ביוכימיה', type:'מבחן', status:'ready', url:'%D7%94%D7%A9%D7%97%D7%96%D7%95%D7%A8-%D7%94%D7%90%D7%9E%D7%99%D7%AA%D7%99-%D7%91%D7%99%D7%95%D7%9B%D7%99%D7%9E%D7%99%D7%94.html', builtin:true },
  { id:'b15', year:'year1', sem:2, subject:'ביוכימיה', name:'ביוכימיה — סיכום מלא', type:'סיכום', status:'ready', url:'%D7%91%D7%99%D7%95%D7%9B%D7%99%D7%9E%D7%99%D7%94_%D7%A1%D7%99%D7%9B%D7%95%D7%9D_%D7%9E%D7%9C%D7%90_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b16', year:'year1', sem:2, subject:'אפידמיולוגיה חלק ב׳', name:'אפידמיולוגיה וחשיבה כמותית — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F_%D7%90%D7%A4%D7%99%D7%93%D7%9E%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94_%D7%AA%D7%A8%D7%92%D7%95%D7%9C.html', builtin:true },
  { id:'b17', year:'year1', sem:2, subject:'אפידמיולוגיה חלק ב׳', name:'סיכום אפידמיולוגיה וחשיבה כמותית', type:'סיכום', status:'ready', url:'%D7%A1%D7%99%D7%9B%D7%95%D7%9D_%D7%90%D7%A4%D7%99%D7%93%D7%9E%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94.html', builtin:true },
  { id:'b18', year:'year1', sem:2, subject:'נוירואנטומיה', name:'נוירואנטומיה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F_%D7%A0%D7%95%D7%99%D7%A8%D7%95%D7%90%D7%A0%D7%98%D7%95%D7%9E%D7%99%D7%94_%D7%9E%D7%97%D7%96%D7%95%D7%A829.html', builtin:true },
  { id:'b19', year:'year1', sem:2, subject:'נפרולוגיה', name:'נפרולוגיה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%A0%D7%A4%D7%A8%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94.html', builtin:true },
  { id:'b20', year:'year1', sem:2, subject:'גסטרואנטרולוגיה', name:'גסטרואנטרולוגיה — מבחן תרגול', type:'מבחן', status:'ready', url:'gastro_exam.html', builtin:true },
  { id:'b21', year:'year1', sem:2, subject:'גסטרואנטרולוגיה', name:'גסטרואנטרולוגיה — מדריך סיכום', type:'סיכום', status:'ready', url:'gastro_study_guide%20%282%29.html', builtin:true },
  { id:'b22', year:'year1', sem:2, subject:'פתופיזיולוגיה של טראומה', name:'פתופיזיולוגיה של טראומה — מבחן תרגול', type:'מבחן', status:'ready', url:'%D7%9E%D7%91%D7%97%D7%9F_%D7%AA%D7%A8%D7%92%D7%95%D7%9C_%D7%A4%D7%AA%D7%95%D7%A4%D7%99%D7%96%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94_%D7%A9%D7%9C_%D7%98%D7%A8%D7%90%D7%95%D7%9E%D7%94.html', builtin:true },
];

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const ov = await readOverrides();
    const hidden = new Set(ov.hidden || []);
    const items = [...SEED.filter(i => !hidden.has(i.id)), ...(ov.items || [])];
    res.json({ items, hasBlob });
  } catch (e) {
    // never leave the site without a catalog
    res.json({ items: SEED, hasBlob, warning: String(e.message || e) });
  }
};
