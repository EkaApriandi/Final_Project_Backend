const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('memulai proses seeding database...');

  // membersihkan data lama
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // hash password default
  const passwordHash = await bcrypt.hash('password123', 10);

  // membuat akun admin 
  await prisma.user.create({
    data: {
      name: 'Safana',
      email: 'safana@gmail.com',
      password: passwordHash,
      role: 'ADMIN'
    }
  });

  // membuat akun user utama
  const userEka = await prisma.user.create({
    data: {
      name: 'Eka',
      email: 'eka@gmail.com',
      password: passwordHash,
      role: 'USER'
    }
  });

  // membuat akun user tambahan 
  await prisma.user.create({
    data: {
      name: 'Apriandi',
      email: 'apriandi@gmail.com',
      password: passwordHash,
      role: 'USER'
    }
  });

  // membuat kategori milik Eka
  const catKuliah = await prisma.category.create({ data: { name: 'Tugas Kuliah', userId: userEka.id } });
  const catOrganisasi = await prisma.category.create({ data: { name: 'Organisasi', userId: userEka.id } });
  const catPribadi = await prisma.category.create({ data: { name: 'Pribadi', userId: userEka.id } });

  // 5. membuat tag global
  const tagUrgent = await prisma.tag.create({ data: { name: 'Urgent' } });
  const tagWaiting = await prisma.tag.create({ data: { name: 'Waiting List' } });
  const tagDone = await prisma.tag.create({ data: { name: 'Done' } });

  // membuat daftar tugas/task (Relasi ke Kategori & Tag)
  
  // Tugas 1
  await prisma.task.create({
    data: {
      title: 'Sistem Manajemen Ecommerce & Inventaris',
      description: 'Membuat aplikasi berbasis web',
      status: 'COMPLETED',
      userId: userEka.id,
      categoryId: catKuliah.id,
      tags: { connect: [{ id: tagDone.id }] }
    }
  });

  // Tugas 2
  await prisma.task.create({
    data: {
      title: 'Final Project Backend',
      description: 'Tugas mata kuliah Pemrograman Web',
      status: 'IN_PROGRESS',
      userId: userEka.id,
      categoryId: catKuliah.id,
      tags: { connect: [{ id: tagUrgent.id }] }
    }
  });

  // Tugas 3
  await prisma.task.create({
    data: {
      title: 'Project Pemrograman Mobile',
      description: 'Membuat aplikasi android sederhana',
      status: 'IN_PROGRESS',
      userId: userEka.id,
      categoryId: catKuliah.id,
      tags: { connect: [{ id: tagUrgent.id }] }
    }
  });

  // Tugas 4
  await prisma.task.create({
    data: {
      title: 'TK Big Data: Clustering',
      description: 'Analisis data menggunakan algoritma clustering',
      status: 'IN_PROGRESS',
      userId: userEka.id,
      categoryId: catKuliah.id,
      tags: { connect: [{ id: tagUrgent.id }] }
    }
  });

  // Tugas 5
  await prisma.task.create({
    data: {
      title: 'Latihan Badminton',
      description: 'Olahraga rutin mingguan',
      status: 'PENDING',
      userId: userEka.id,
      categoryId: catPribadi.id,
      tags: { connect: [{ id: tagWaiting.id }] }
    }
  });

  // Tugas 6
  await prisma.task.create({
    data: {
      title: 'Rapat Kerja',
      description: 'Pemaparan Program Kerja selama satu periode',
      status: 'PENDING',
      userId: userEka.id,
      categoryId: catOrganisasi.id,
      tags: { connect: [{ id: tagWaiting.id }] }
    }
  });

  console.log('seeding selesai, data eka siap digunakan');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });