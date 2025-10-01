rm -rf .next
pm2 stop admin-frontend
pnpm run build
pm2 reload admin-frontend
pm2 logs admin-frontend