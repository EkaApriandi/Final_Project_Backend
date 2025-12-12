# Dokumentasi API Task Management

**Base URL:** `http://[IP_PUBLIC_AWS]:3000/api` (Production) atau `http://localhost:3000/api` (Local)
**Auth:** Bearer Token (JWT)

## 1. Autentikasi

### Register User
`POST /auth/register`
Mendaftarkan pengguna baru.

**Body:**
```json
{
  "name": "Eka",
  "email": "eka@gmail.com",
  "password": "password123"
}
Login
POST /auth/login Masuk dan mendapatkan Access Token & Refresh Token.

Body:

JSON

{
  "email": "eka@gmail.com",
  "password": "password123"
}
Get Profile (Me)
GET /auth/me Headers: Authorization: Bearer <token> Mengambil data profil user yang sedang login.

2. Tasks (Tugas)
Get All Tasks
GET /tasks Headers: Authorization: Bearer <token> Mengambil daftar tugas dengan filter dan pagination.

Query Parameters:

page: Nomor halaman (default: 1)

limit: Data per halaman (default: 10)

search: Cari judul/deskripsi

categoryId: Filter berdasarkan ID kategori

status: Filter status (PENDING, IN_PROGRESS, COMPLETED)

sortBy: Field untuk urutan (createdAt, dueDate)

order: asc atau desc

Create Task
POST /tasks Headers: Authorization: Bearer <token>

Body:

JSON

{
  "title": "Final Project Backend",
  "description": "Tugas wajib mata kuliah",
  "dueDate": "2025-12-31",
  "categoryId": 1,
  "tags": ["Urgent", "Kuliah"]
}
Update Task
PUT /tasks/:id Headers: Authorization: Bearer <token>

Body:

JSON

{
  "status": "COMPLETED"
}
Delete Task
DELETE /tasks/:id Headers: Authorization: Bearer <token> Menghapus tugas.

3. Categories & Tags
Create Category
POST /categories Headers: Authorization: Bearer <token>

Body:

JSON

{
  "name": "Organisasi"
}
Get Categories
GET /categories Headers: Authorization: Bearer <token>

Create Tag
POST /tags Headers: Authorization: Bearer <token>

Body:

JSON

{
  "name": "Urgent"
}