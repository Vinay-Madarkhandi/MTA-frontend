# Demo Mode - Manager Presentation Guide

## Overview
The application is currently running in **DEMO MODE** with mock data. This allows you to demonstrate the full functionality without needing the backend server running.

## Features Available in Demo Mode

### ✅ Full UI Demonstration
- **Dashboard**: Shows business overview with sales and inventory stats
- **Products**: Complete CRUD operations (Create, Read, Update, Delete)
- **Sales**: View all sales transactions
- **New Sale**: Create new sales orders
- **Orders**: View and filter orders by status
- **Stocks**: Stock management hub
- **Reports**: Analytics and reporting interface
- **Settings**: User preferences and configuration

### 🎯 Mock Data Included
- 5 sample products (Wheat, Rice, Fertilizer, Tractor Oil, Corn Seeds)
- 5 sample orders with different statuses (PAID, PENDING, CANCELLED)
- Inventory summary with stock levels
- Dashboard statistics
- User authentication (any email/password works)

### 🔄 Simulated Functionality
- Login/Registration (automatically succeeds)
- Product creation, updates, and deletion (changes persist during session)
- Order creation
- Stock adjustments
- Real-time UI updates
- Network delay simulation (realistic loading states)

## How to Present to Manager

1. **Start the Application**
   ```powershell
   cd mta-frontend
   npm run dev
   ```
   Open browser at: http://localhost:3000

2. **Login Flow**
   - Use any email (e.g., `demo@shreeshai.com`)
   - Use any password (e.g., `demo123`)
   - Shows authentication flow

3. **Dashboard Demo**
   - Yellow banner indicates DEMO MODE
   - Shows sales overview (₹45,500 total)
   - Inventory status (5 products, 1 low stock, 1 out of stock)
   - Quick action buttons

4. **Products Management**
   - View 5 sample products
   - Click "Add Product" - shows form validation
   - Edit/Delete products - shows confirmation dialogs
   - See status badges (In Stock, Low Stock, Out of Stock)

5. **Orders Management**
   - View all orders with filtering (ALL/PAID/PENDING/CANCELLED)
   - See order statistics
   - Create new orders from sales page

6. **Full Navigation**
   - Sidebar navigation works completely
   - All pages are responsive
   - Active page highlighting

## Switching to Production Mode

When backend is ready:

1. Open `mta-frontend/lib/mockData.ts`
2. Change line 2:
   ```typescript
   export const DEMO_MODE = false; // Set to false when backend is ready
   ```
3. Ensure backend is running at `http://localhost:8080`
4. Restart frontend: `npm run dev`

## Technical Details

### Mock Data Location
- `lib/mockData.ts` - All mock data and API simulation
- Includes delay simulation for realistic network behavior

### Modified Files
- `lib/api/auth.ts` - Auth with mock support
- `lib/api/products.ts` - Products with mock support
- `lib/api/orders.ts` - Orders with mock support
- `app/dashboard/page.tsx` - Demo mode banner

### Data Persistence
- Changes persist only during the current browser session
- Refresh page to reset to initial mock data
- Adding products increments IDs automatically

## Benefits for Presentation
✅ No backend setup required  
✅ No database configuration needed  
✅ Instant demonstration ready  
✅ All features fully functional  
✅ Professional loading states  
✅ Realistic user experience  
✅ Easy to explain and understand  

## Next Steps After Approval
1. Configure MySQL database credentials
2. Start Spring Boot backend
3. Set `DEMO_MODE = false`
4. Connect to real API endpoints
5. Test with actual data
