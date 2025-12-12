const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('memulai proses seeding database...');

  // Menghapus data lama agar tidak duplikat
  await prisma.taskFile.deleteMany();
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Menyiapkan password default yang sudah di-hash
  const passwordHash = await bcrypt.hash('password123', 10);

  // Mendaftarkan akun admin
  await prisma.user.create({
    data: { name: 'Safana', email: 'safana@gmail.com', password: passwordHash, role: 'ADMIN' }
  });

  // Mendaftarkan akun user reguler
  const userEka = await prisma.user.create({
    data: { name: 'Eka', email: 'eka@gmail.com', password: passwordHash, role: 'USER' }
  });

  const userApriandi = await prisma.user.create({
    data: { name: 'Apriandi', email: 'apriandi@gmail.com', password: passwordHash, role: 'USER' }
  });

  const userBudi = await prisma.user.create({
    data: { name: 'Budi Santoso', email: 'budi@gmail.com', password: passwordHash, role: 'USER' }
  });

  // Menambahkan kategori untuk setiap user
  const catEka1 = await prisma.category.create({ data: { name: 'Tugas Kuliah', userId: userEka.id } });
  const catEka2 = await prisma.category.create({ data: { name: 'Organisasi', userId: userEka.id } });
  
  const catApriandi1 = await prisma.category.create({ data: { name: 'Pekerjaan', userId: userApriandi.id } });
  const catBudi1 = await prisma.category.create({ data: { name: 'Hobi', userId: userBudi.id } });

  // Membuat tag global
  const tagUrgent = await prisma.tag.create({ data: { name: 'Urgent' } });
  const tagWaiting = await prisma.tag.create({ data: { name: 'Waiting List' } });
  const tagDone = await prisma.tag.create({ data: { name: 'Done' } });
  const tagMeeting = await prisma.tag.create({ data: { name: 'Meeting' } });

  // Mengisi tugas simulasi untuk Eka
  await prisma.task.create({
    data: {
      title: 'Sistem Manajemen Ecommerce',
      description: 'Membuat aplikasi berbasis web dengan Vue dan Express',
      status: 'COMPLETED',
      userId: userEka.id,
      categoryId: catEka1.id,
      dueDate: new Date('2024-01-15'),
      tags: { connect: [{ id: tagDone.id }] }
    }
  });

  await prisma.task.create({
    data: {
      title: 'Final Project Backend',
      description: 'Deployment ke AWS EC2',
      status: 'IN_PROGRESS',
      userId: userEka.id,
      categoryId: catEka1.id,
      dueDate: new Date('2024-12-31'),
      tags: { connect: [{ id: tagUrgent.id }] }
    }
  });

  await prisma.task.create({
    data: {
      title: 'Rapat Kerja Himpunan',
      description: 'Pemaparan Program Kerja',
      status: 'PENDING',
      userId: userEka.id,
      categoryId: catEka2.id,
      dueDate: new Date('2025-02-20'),
      tags: { connect: [{ id: tagWaiting.id }, { id: tagMeeting.id }] }
    }
  });

  // Mengisi tugas simulasi untuk Apriandi
  await prisma.task.create({
    data: {
      title: 'Laporan Bulanan',
      description: 'Rekapitulasi keuangan bulan November',
      status: 'IN_PROGRESS',
      userId: userApriandi.id,
      categoryId: catApriandi1.id,
      dueDate: new Date('2024-12-05'),
      tags: { connect: [{ id: tagUrgent.id }] }
    }
  });

  await prisma.task.create({
    data: {
      title: 'Meeting Klien',
      description: 'Presentasi produk baru',
      status: 'PENDING',
      userId: userApriandi.id,
      categoryId: catApriandi1.id,
      tags: { connect: [{ id: tagMeeting.id }] }
    }
  });

  // Mengisi tugas simulasi untuk Budi
  await prisma.task.create({
    data: {
      title: 'Jogging Pagi',
      description: 'Lari keliling komplek',
      status: 'PENDING',
      userId: userBudi.id,
      categoryId: catBudi1.id,
      tags: { connect: [{ id: tagWaiting.id }] }
    }
  });

  console.log('Seeding selesai! Data siap digunakan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });