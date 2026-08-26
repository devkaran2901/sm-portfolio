import fs from 'node:fs';
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=');
  if (i === -1) continue;
  const k = line.slice(0, i).trim();
  let v = line.slice(i + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[k] = v;
}
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL, 'len', process.env.DATABASE_URL?.length);
const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient({ log: ['error'] });
try {
  const t = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  console.log('SELECT 1 ok in', Date.now() - t, 'ms');
  const p = await prisma.profile.findUnique({ where: { id: 'primary' } });
  console.log('profile:', p ? 'FOUND' : 'null');
  const s = await prisma.siteStat.count();
  console.log('siteStat count:', s);
} catch (e) {
  console.log('ERROR name:', e?.constructor?.name);
  console.log('ERROR message:', JSON.stringify(e?.message));
} finally {
  await prisma.$disconnect();
}
