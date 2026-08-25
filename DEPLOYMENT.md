# 🚀 Panduan Deployment Docker (VM / VPS Production)
### Sistem Manajemen FTTH Cluster — PT Indotek Buana Karya

Dokumen ini berisi panduan langkah demi langkah untuk menjalankan aplikasi **FTTH Cluster Management** menggunakan **Docker & Docker Compose** di Virtual Machine (VM) Anda.

---

## 🏗️ Arsitektur Kontainer Docker

Sistem ini berjalan dengan 3 kontainer terisolasi dalam satu private bridge network:

```
                  ┌──────────────────────────────────────────────┐
                  │          Internet / Browser Klien            │
                  └──────────────────────┬───────────────────────┘
                                         │ Port 80 (HTTP) / 443
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       Kontainer Nginx Reverse Proxy          │
                  │   - Gzip Compression                         │
                  │   - Upload buffer hingga 50MB (Foto & Excel) │
                  │   - Security Headers                         │
                  └──────────────────────┬───────────────────────┘
                                         │ Proxy pass port 3000
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    Kontainer Next.js App (Frontend + API)    │
                  │   - Standalone Production Runner (Node 20)   │
                  │   - Role-Based Access Control                │
                  │   - Calculation Engine (Margin, DPR, Termin) │
                  └──────────────────────┬───────────────────────┘
                                         │ Port 5432 (Internal)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │        Kontainer PostgreSQL 16 DB            │
                  │   - Persistent Volume: ftth_postgres_data    │
                  │   - Auto-Init Schema (init-db/01-init.sql)   │
                  └──────────────────────────────────────────────┘
```

---

## 📋 1. Persyaratan Server VM

Pastikan VM Anda sudah terinstall:
- **OS**: Ubuntu 22.04 / 24.04 LTS (atau Debian / Rocky Linux)
- **RAM**: Minimal 2 GB (Disarankan 4 GB)
- **Storage**: Minimal 20 GB SSD
- **Software**: `docker` dan `docker-compose` (Docker Compose v2)

### Cara Cepat Install Docker di Ubuntu (jika belum ada):
```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Docker Engine & Docker Compose plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Tambahkan user saat ini ke grup docker (agar tidak perlu sudo)
sudo usermod -aG docker $USER
newgrp docker

# Cek versi docker
docker --version
docker compose version
```

---

## ⚡ 2. Langkah Menjalankan Aplikasi di VM (1-Command Deploy)

### Langkah 1: Copy / Clone Folder Project ke VM
Anda dapat menyalin file project ke server menggunakan `scp`, `rsync`, atau `git clone`:
```bash
# Contoh menggunakan Git atau SCP ke folder home VM:
cd ~/ftth-cluster-management
```

### Langkah 2: Periksa Konfigurasi Lingkungan (`.env.production`)
Pastikan password database dan pengaturan port sudah sesuai:
```bash
cp .env.example .env.production
```

### Langkah 3: Build & Jalankan Docker Container
Jalankan satu perintah ini untuk mendownload image, mem-build aplikasi Next.js secara standalone, dan menyalakan database:
```bash
docker compose up -d --build
```

### Langkah 4: Cek Status Kontainer
```bash
docker compose ps
```
Output yang diharapkan:
```text
NAME                IMAGE               COMMAND                  SERVICE             STATUS
ftth_app            ftth-app            "node server.js"         app                 running (healthy)
ftth_postgres       postgres:16-alpine  "docker-entrypoint.s…"   postgres            running (healthy)
ftth_nginx          nginx:alpine        "/docker-entrypoint.…"   nginx               running
```

---

## 🌐 3. Mengakses Aplikasi

Setelah kontainer berjalan:
- Buka browser di laptop Anda dan akses alamat IP VM Anda:
  ```text
  http://<IP_SERVER_VM_ANDA>/
  ```
  *(Contoh: `http://192.168.1.100/` atau `http://103.xxx.xxx.xxx/`)*

- Atau langsung akses port aplikasi:
  ```text
  http://<IP_SERVER_VM_ANDA>:3000/
  ```

---

## 🔒 4. Konfigurasi Domain & SSL HTTPS Gratis (Let's Encrypt / Certbot)

Jika Anda menghubungkan domain (contoh: `ftth.indotek.co.id`) ke IP VM Anda:

```bash
# 1. Install Certbot di VM Host
sudo apt install -y certbot python3-certbot-nginx

# 2. Dapatkan sertifikat SSL otomatis
sudo certbot --nginx -d ftth.indotek.co.id
```

Certbot akan otomatis mengonfigurasi sertifikat HTTPS gratis dan mengaktifkan perpanjangan otomatis (*auto-renewal*).

---

## 🛠️ 5. Perintah Manajemen Operasional Harian

### Melihat Log Aplikasi Real-time:
```bash
# Log seluruh layanan
docker compose logs -f

# Log khusus aplikasi Next.js
docker compose logs -f app

# Log PostgreSQL
docker compose logs -f postgres
```

### Me-restart Aplikasi:
```bash
docker compose restart
```

### Update Kode / Deploy Versi Baru:
```bash
# Tarik kode terbaru
git pull origin main

# Rebuild dan deploy tanpa downtime lama
docker compose up -d --build
```

### Menghentikan Aplikasi:
```bash
# Menghentikan sementara
docker compose down

# Menghentikan dan membersihkan container (data database di volume tetap aman)
docker compose down
```

---

## 💾 6. Backup & Restore Database PostgreSQL

### Cara Backup Database ke File SQL:
```bash
docker exec -t ftth_postgres pg_dump -U indotek_admin ftth_db > backup_ftth_$(date +%F).sql
```

### Cara Restore Database dari File SQL:
```bash
cat backup_ftth_2026-08-25.sql | docker exec -i ftth_postgres psql -U indotek_admin -d ftth_db
```

---

## 👨‍💻 Akun Demo Default untuk Pengujian

| Role | Email | Password | Wewenang |
| :--- | :--- | :--- | :--- |
| **Project Manager** | `pm@indotek.co.id` | `password123` | Approval SPK Mandor, Approval PO Material Level 1, Validasi DPR |
| **Cost Estimator** | `estimator@indotek.co.id` | `password123` | Input BOQ, kalkulasi margin, setting harga borongan mandor |
| **Finance & Treasury** | `finance@indotek.co.id` | `password123` | Validasi syarat termin/kasbon, eksekusi transfer supplier/mandor |
| **Procurement** | `procurement@indotek.co.id` | `password123` | Terbitkan PO aksesoris ke toko, serah terima Surat Jalan |
| **Direktur (Super Admin)** | `direktur@indotek.co.id` | `password123` | Akses penuh, override approval, audit trail log |
