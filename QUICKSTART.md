# UDealZone Web - Quick Start Guide

Get the UDealZone marketplace up and running in minutes!

## 🚀 5-Minute Setup

### 1. Install & Run
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit http://localhost:3000 - Done! ✓

### 2. Configuration (Optional)
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api-v2.udealzone.com/api
```

---

## 📱 Quick Test Routes

After starting the dev server, visit these URLs:

| Route | Description |
|-------|-------------|
| `/` | Home page with products |
| `/auth/signup` | Create account |
| `/auth/login` | Login to account |
| `/auth/forgot-password` | Reset password |
| `/my-ads` | Your listings (requires login) |
| `/add-post` | Post new ad (requires login) |

---

## ✨ Key Features to Try

### 1. Browse Products
- Visit home page
- See all 10 categories
- Scroll through products
- Click product cards for details

### 2. Create Account
- Click "Sign Up" button
- Enter email, name, password
- Select city
- Optional: Add promo code
- Account created!

### 3. Login
- Click "Log In" button
- Enter email and password
- Access restricted features

### 4. Post New Ad
- Must be logged in
- Click "Add Post" button
- Select category (e.g., Vehicles)
- Select subcategory
- (Form ready for next steps)

### 5. View Your Ads
- Must be logged in
- Click "My Ads" in navbar
- See your listings
- Edit, delete, or mark as sold

### 6. Chat with Assistant
- Click orange chat bubble (bottom right)
- Type a message
- AI responds

---

## 🎨 What You See

### Design
- Navy blue (#003049) and orange (#F97316) branding
- Clean white background
- Smooth animations
- Fully responsive layout

### Navigation
- Sticky navbar with logo
- Auth-aware menu (Login/Signup or My Ads)
- Floating chatbot button
- Back-to-top button on scroll

### Loading
- Splash screen on first visit
- Skeleton loaders while fetching data
- Smooth page transitions

---

## 🔑 Demo Credentials

**Note**: To fully test, you need to:
1. Create a new account via signup flow
2. Or use credentials from your backend

---

## 🛠️ Build for Production

```bash
# Build optimized production bundle
pnpm build

# Start production server
pnpm start
```

---

## 📂 File Structure (Key Files)

```
Key Locations:
- Home Page: app/page.tsx
- Auth Pages: app/auth/*/page.tsx
- My Ads: app/my-ads/page.tsx
- Add Post: app/add-post/page.tsx
- API Services: src/api/services/
- Components: src/components/
- Styles: app/globals.css
```

---

## 🔗 API Base URL

Default: `https://api-v2.udealzone.com/api`

Change in `.env.local`:
```
NEXT_PUBLIC_API_URL=your_api_url_here
```

---

## ✅ Checklist

- [ ] Run `pnpm install`
- [ ] Run `pnpm dev`
- [ ] Visit http://localhost:3000
- [ ] See splash screen
- [ ] Browse products
- [ ] Sign up for account
- [ ] Create new listing
- [ ] Try chatbot

---

## 🆘 Troubleshooting

### Page won't load
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### API errors
- Check `.env.local` has correct API URL
- Check internet connection
- Verify backend API is running

### Build errors
- Update Node.js to version 18+
- Clear `.next` folder
- Reinstall dependencies

---

## 📚 Full Documentation

See `README.md` for complete documentation.

---

## 🎉 You're Ready!

The application is production-ready and fully functional. Enjoy building with UDealZone!

---

**Questions?** Check the README.md or review component code for implementation details.
