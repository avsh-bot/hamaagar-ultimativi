// GET/POST /api/catalog — the built-in catalog, merged with whatever was uploaded or hidden
// through the admin page. Uploads live in Vercel Blob, never on the (read-only) filesystem.
const { readOverrides } = require('./_store');

// The built-in curriculum. Edit here if a course name changes; uploads never touch this.
const SEED = [
  { id:'b1',  year:'year1', sem:1, subject:'כימיה',                                 name:'כימיה',                                 type:'מבחן', status:'empty', builtin:true },
  { id:'b2',  year:'year1', sem:1, subject:'ביולוגיה',                              name:'ביולוגיה',                              type:'מבחן', status:'empty', builtin:true },
  { id:'b3',  year:'year1', sem:1, subject:'אפידמיולוגיה חלק א׳',                   name:'אפידמיולוגיה חלק א׳',                   type:'מבחן', status:'empty', builtin:true },
  { id:'b4',  year:'year1', sem:1, subject:'אנטומיה כללית',                         name:'אנטומיה כללית',                         type:'מבחן', status:'empty', builtin:true },
  { id:'b5',  year:'year1', sem:1, subject:'EMT',                                   name:'EMT',                                   type:'מבחן', status:'empty', builtin:true },
  { id:'b6',  year:'year1', sem:1, subject:'היסטולוגיה ופתולוגיה',                  name:'היסטולוגיה ופתולוגיה',                  type:'מבחן', status:'empty', builtin:true },
  { id:'b7',  year:'year1', sem:1, subject:'מיקרוביולוגיה, אימונולוגיה ווירולוגיה', name:'מיקרוביולוגיה, אימונולוגיה ווירולוגיה', type:'מבחן', status:'empty', builtin:true },
  { id:'b8',  year:'year1', sem:1, subject:'המטולוגיה',                             name:'המטולוגיה',                             type:'מבחן', status:'empty', builtin:true },
  { id:'b9',  year:'year1', sem:1, subject:'פרמקולוגיה',                            name:'פרמקולוגיה',                            type:'מבחן', status:'empty', builtin:true },
  { id:'b10', year:'year1', sem:2, subject:'קרדיולוגיה',                            name:'קרדיולוגיה',                            type:'מבחן', status:'empty', builtin:true },
  { id:'b11', year:'year1', sem:2, subject:'נשימה',                                 name:'נשימה',                                 type:'מבחן', status:'empty', builtin:true },
  { id:'b12', year:'year1', sem:2, subject:'ביוכימיה',                              name:'ביוכימיה',                              type:'מבחן', status:'empty', builtin:true },
  { id:'b13', year:'year1', sem:2, subject:'אפידמיולוגיה חלק ב׳',                   name:'אפידמיולוגיה חלק ב׳',                   type:'מבחן', status:'empty', builtin:true },
  { id:'b14', year:'year1', sem:2, subject:'נוירואנטומיה',                          name:'נוירואנטומיה',                          type:'מבחן', status:'empty', builtin:true },
  { id:'b15', year:'year1', sem:2, subject:'נפרולוגיה',                             name:'נפרולוגיה',                             type:'מבחן', status:'empty', builtin:true },
  { id:'b16', year:'year1', sem:2, subject:'גסטרואנטרולוגיה',                       name:'גסטרואנטרולוגיה',                       type:'מבחן', status:'empty', builtin:true },
  { id:'b17', year:'year1', sem:2, subject:'פתופיזיולוגיה של טראומה',               name:'פתופיזיולוגיה של טראומה',               type:'מבחן', status:'empty', builtin:true },
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
