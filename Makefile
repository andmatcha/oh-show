init:
	cd frontend && npm install
	cd backend && npm install

start:
	cd frontend && npm run dev &
	cd backend && npm run start:dev
