import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.musicTrack.findMany();
  console.log(`Found ${tracks.length} tracks in database.`);

  for (const t of tracks) {
    if (t.audioUrl && (t.audioUrl.startsWith('/audio/') || t.audioUrl.startsWith('/music/') || !t.audioUrl.startsWith('https://'))) {
      const updated = await prisma.musicTrack.update({
        where: { id: t.id },
        data: {
          audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Backed_Vibes_%28clean%29_%28ISRC_USUAN1100479%29.mp3',
          artworkUrl: t.artworkUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
          title: t.title || 'Solarflex Study Flow',
          artist: 'Kevin MacLeod (Incompetech)',
          fileName: null,
          fileSize: '3.4 MB',
        },
      });
      console.log(`Migrated database track ${updated.id}: new audioUrl = ${updated.audioUrl}`);
    }
  }

  const finalTracks = await prisma.musicTrack.findMany();
  console.log('Database tracks after migration:', finalTracks.map((x) => ({ id: x.id, title: x.title, audioUrl: x.audioUrl })));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
