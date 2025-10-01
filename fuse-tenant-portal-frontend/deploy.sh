rm -rf .next
pm2 stop tenant-portal-frontend
pnpm run build
pm2 reload tenant-portal-frontend
pm2 logs tenant-portal-frontend