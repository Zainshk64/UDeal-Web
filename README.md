# UDealZone - Modern Marketplace Web Application

A production-ready React/Next.js web application for a buy-and-sell marketplace platform. Built with TypeScript, Tailwind CSS, and modern best practices.

## 🎯 Overview

UDealZone is a full-featured marketplace platform that connects buyers and sellers. This is the web version built with Next.js 16, featuring:

- **Modern Design System** - Navy (#003049) and Orange (#F97316) brand colors
- **Complete Authentication** - Login, Signup, OTP verification, Password reset
- **Product Listing** - Browse products by category with favorites
- **My Ads Management** - Users can manage, edit, delete, and mark ads as sold
- **Multi-Step Post Creation** - Easy-to-use wizard for posting new ads
- **AI Chatbot Assistant** - Floating chatbot for customer support
- **Fully Responsive** - Mobile, tablet, and desktop optimized
- **Production Quality** - Clean code, reusable components, proper error handling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd UDealZone-Web
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your API configuration:
```
NEXT_PUBLIC_API_URL=https://api-v2.udealzone.com/api
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
UDealZone-Web/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Global styles & design system
│   └── auth/                     # Authentication pages
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       ├── forgot-password/page.tsx
│       ├── verify-otp/page.tsx
│       └── reset-password/page.tsx
│   ├── my-ads/page.tsx           # User's listings page
│   └── add-post/page.tsx         # Multi-step post creation
│
├── src/
│   ├── api/services/             # API integration layer
│   │   ├── api.ts                # Axios instance with interceptors
│   │   ├── AuthApi.ts            # Authentication endpoints
│   │   ├── HomeApi.ts            # Product listing endpoints
│   │   ├── MyAdsApi.ts           # User ads management
│   │   └── ChatbotApi.ts         # AI chatbot endpoints
│   │
│   ├── components/               # Reusable React components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Navigation bar
│   │   │   ├── Footer.tsx        # Footer with links
│   │   │   └── SplashScreen.tsx  # Loading splash
│   │   ├── home/
│   │   │   ├── HomePage.tsx      # Main home page
│   │   │   └── ProductCard.tsx   # Product display card
│   │   ├── myads/
│   │   │   └── MyAdsCard.tsx     # User ads card with actions
│   │   ├── addpost/
│   │   │   ├── Step1Category.tsx    # Category selection
│   │   │   └── Step2Subcategory.tsx # Subcategory selection
│   │   ├── chatbot/
│   │   │   └── Chatbot.tsx       # AI assistant widget
│   │   └── loaders/
│   │       └── SkeletonLoader.tsx # Loading placeholders
│   │
│   ├── context/                  # React Context
│   │   └── AuthContext.tsx       # Global auth state
│   │
│   └── utils/                    # Utility functions
│       ├── storage.ts            # localStorage helpers
│       ├── image.ts              # Image URL & CDN helpers
│       ├── format.ts             # Formatting utilities
│       └── constants.ts          # App constants & configs
```

## 🔐 Authentication Flow

1. **Login/Signup** - Email and password with validation
2. **OTP Verification** - 6-digit code sent to email
3. **Forgot Password** - OTP-based password reset
4. **Session Management** - Tokens stored securely in localStorage
5. **Auto Token Refresh** - Axios interceptors handle token refresh
6. **Protected Routes** - Auth context checks before accessing restricted pages

## 🎨 Design System

### Colors
- **Primary**: `#003049` (Navy Blue)
- **Accent**: `#F97316` (Orange)
- **Background**: `#ffffff` (White)
- **Neutrals**: Gray scale from `#f9fafb` to `#111827`

### Typography
- **Font Family**: System fonts (`Geist` via Google Fonts)
- **Headings**: Bold weights (600-800)
- **Body**: Regular weights (400-500)

### Spacing
- Consistent spacing scale: `xs` (4px) → `4xl` (64px)
- Use Tailwind classes for consistency

### Components
- Rounded corners: `0.75rem` (12px) default
- Shadows: Soft to hard variations
- Animations: Smooth transitions using Framer Motion

## 📡 API Integration

All API calls go through the centralized Axios instance (`api.ts`) with:

- **Base URL**: `https://api-v2.udealzone.com/api`
- **Request Interceptor**: Adds auth tokens automatically
- **Response Interceptor**: Handles token refresh and error states
- **Error Handling**: Consistent error messages via toast notifications

### API Endpoints

**Authentication**
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - Logout
- `POST /otp/send` - Send OTP
- `POST /otp/verifyOTP` - Verify OTP

**Home/Products**
- `GET /Home/Home-Page-default` - Get home feed
- `GET /Home/Home-Page-ByCity` - City-based products
- `GET /Home/Home-Page-By-Location` - Location-based products
- `GET /products/GetProductbyId` - Product details

**My Ads**
- `GET /MyAds/GetMyAds` - List user's ads
- `POST /MyAds/DeleteProduct` - Delete ad
- `POST /MyAds/MarkAsSold` - Mark as sold

**Categories**
- `GET /Default/categories` - Get all categories
- `GET /Default/subcategories` - Get subcategories
- `GET /Default/cities` - Get cities list

**Chatbot**
- `POST /udeal-ai/chat` - Send chat message

## 🎭 State Management

- **Global Auth State**: React Context (`AuthContext.tsx`)
- **Local Component State**: React `useState`
- **Async Data**: Handled through API services
- **localStorage**: Token and user data persistence

## 🔄 Data Flow

1. **User Login** → API call → Store tokens → Update Auth Context → Redirect
2. **Browse Products** → Fetch from HomeApi → Display with loaders → Cache data
3. **Add to Favorites** → User auth check → API call → Update UI
4. **Post Ad** → Multi-step form → Collect data → API call → Redirect to My Ads

## 📱 Responsive Design

- **Mobile** (< 640px): Single column, full-width
- **Tablet** (640px - 1024px): 2-column layouts
- **Desktop** (> 1024px): 3-4 column grids
- **Breakpoints**: `sm`, `md`, `lg`, `xl` using Tailwind

## 🚀 Performance Optimizations

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic with Next.js App Router
- **Skeleton Loaders**: Show placeholders while data loads
- **Smooth Animations**: Framer Motion for polished UX
- **Proper Caching**: localStorage for auth tokens and static data
- **API Efficiency**: Single axios instance with interceptors

## 🔒 Security

- **Password Hashing**: Backend handles bcrypt hashing
- **Token Management**: Access and refresh tokens
- **HTTPS Only**: All API calls use HTTPS
- **Input Validation**: Client-side validation on all forms
- **XSS Protection**: React prevents XSS by default
- **CSRF Protection**: Backend API handles CSRF tokens

## 🧪 Component Usage Examples

### ProductCard
```tsx
import { ProductCard } from '@/components/home/ProductCard';

<ProductCard 
  product={ad}
  onFavoriteToggle={handleToggleFavorite}
/>
```

### MyAdsCard
```tsx
import { MyAdsCard } from '@/components/myads/MyAdsCard';

<MyAdsCard
  ad={ad}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onMarkAsSold={handleMarkAsSold}
/>
```

### SplashScreen
```tsx
import { SplashScreen } from '@/components/layout/SplashScreen';

<SplashScreen 
  onComplete={handleComplete}
  duration={2500}
/>
```

## 📚 Key Libraries

- **React 19.2**: Latest React features
- **Next.js 16**: App Router, optimizations
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Axios**: HTTP client with interceptors
- **Sonner**: Toast notifications
- **React Icons**: Icon library
- **Zustand** (optional): State management

## 🛠️ Development

### Available Scripts
```bash
pnpm dev      # Start dev server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Adding New Components
1. Create in `src/components/<category>/`
2. Export with `export const ComponentName`
3. Use in pages/other components
4. Keep components pure and reusable

### Adding New API Endpoints
1. Add to appropriate service file in `src/api/services/`
2. Use centralized `apiClient` instance
3. Add types/interfaces
4. Use in React components via hooks

## 🐛 Debugging

Enable debug logs in development:
```typescript
// Use console.log with [v0] prefix
console.log("[v0] Message", data);
```

Check browser DevTools:
- **Network**: API calls and responses
- **Application**: localStorage tokens
- **Console**: Error messages and warnings

## 📖 Future Enhancements

- [ ] Product detail page with full information
- [ ] Search and filtering functionality
- [ ] User reviews and ratings
- [ ] Messaging system between buyers/sellers
- [ ] Payment integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics tracking

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is proprietary to UDealZone.

## 📞 Support

For issues or questions:
- Check documentation
- Review existing code patterns
- Check API responses in browser DevTools
- Contact the development team

## 🎉 Credits

Built with attention to detail and production best practices. Designed for scalability and maintainability.

---

**Last Updated**: March 2026
**Version**: 1.0.0
