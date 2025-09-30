pm2 stop patient-api
pnpm run build
pm2 reload patient-api
pm2 logs patient-api