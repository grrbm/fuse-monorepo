rm -rf .next
pm2 stop patient-frontend
pnpm run build
pm2 reload patient-frontend
pm2 logs patient-frontend