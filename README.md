# Modern Full-Stack E-Commerce

A portfolio-ready full-stack e-commerce starter with React + Vite + Tailwind CSS on the frontend and Node.js + Express + MongoDB on the backend.

## Included
- Customer storefront, product listing/details, cart, wishlist, checkout, authentication, orders and account dashboard
- Admin dashboard with product/order/customer/coupon management foundations
- JWT + bcrypt authentication
- Mongoose models and REST APIs
- Razorpay-ready payment service
- Cloudinary-ready upload service
- Email notification service
- Validation, rate limiting, Helmet, CORS and centralized errors
- Responsive premium UI, dark/light mode, skeletons and toast notifications
- Seed script with realistic demo data

## Run
1. `cd server && npm install`
2. Copy `.env.example` to `.env` and configure MongoDB/JWT.
3. `npm run seed`
4. `npm run dev`
5. In another terminal: `cd client && npm install`
6. Copy `.env.example` to `.env`
7. `npm run dev`

Frontend: http://localhost:5173
Backend: http://localhost:5000

Demo admin after seeding:
- email: admin@example.com
- password: Admin@12345

Change demo credentials before deployment.
