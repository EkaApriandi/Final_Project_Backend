# Laporan Deployment AWS EC2

Dokumen ini berisi detail dan langkah-langkah deployment aplikasi ke AWS EC2.

## 1. Informasi Production
- **Public URL:** `http://[MASUKKAN_IP_PUBLIC_AWS_DISINI]`
- **Health Check:** `http://[MASUKKAN_IP_PUBLIC_AWS_DISINI]/`
- **Instance ID:** `[MASUKKAN_INSTANCE_ID]`
- **Region:** `us-east-1`
- **OS:** Ubuntu Server 22.04 LTS
- **Instance Type:** t2.micro

## 2. Langkah Deployment (Step-by-Step)

Berikut adalah perintah yang dijalankan pada server untuk men-deploy aplikasi:

### A. Persiapan Server
Masuk ke terminal server via SSH:
```bash
# Update package sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git & PM2 (Process Manager)
sudo apt install git -y
sudo npm install -g pm2
B. Setup Aplikasi
Bash

# Clone Repository dari GitHub
git clone [MASUKKAN_LINK_GITHUB_KAMU_DISINI]
cd final-project-backend

# Install Dependencies
npm install

# Setup Environment Production
nano .env
# (Di sini saya menyalin isi .env.example dan mengisi JWT_SECRET serta NODE_ENV=production)

# Database Migration (Production)
npx prisma generate
npx prisma migrate deploy

# Seeding Data Awal
node prisma/seed.js
C. Menjalankan Aplikasi (PM2)
Bash

# Menjalankan aplikasi di background
pm2 start src/app.js --name "task-api"

# Memastikan aplikasi jalan otomatis saat server restart
pm2 startup
pm2 save
D. Konfigurasi Reverse Proxy (Nginx)
Bash

# Install Nginx
sudo apt install nginx -y

# Edit konfigurasi default
sudo nano /etc/nginx/sites-available/default
Konfigurasi Nginx yang digunakan:

Nginx

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
Restart Nginx:

Bash

sudo systemctl restart nginx
3. Monitoring & Maintenance
Cara memantau aplikasi di server:

Cek status aplikasi: pm2 status

Cek logs error/output: pm2 logs

Monitor penggunaan RAM/CPU: pm2 monit