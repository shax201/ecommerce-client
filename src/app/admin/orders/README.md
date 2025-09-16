# Order Management Module

A comprehensive order management system for the admin panel built with Next.js, Redux Toolkit, and TypeScript.

## Features

### 📋 Order Management
- **Order List**: View all orders with filtering, search, and pagination
- **Order Details**: Comprehensive order information with customer and product details
- **Order Editing**: Update order status, tracking information, and notes
- **Bulk Operations**: Select multiple orders for batch status updates and deletions

### 📊 Analytics Dashboard
- **Key Metrics**: Total orders, revenue, average order value, and customer count
- **Status Breakdown**: Orders grouped by status (pending, processing, shipped, delivered, cancelled)
- **Monthly Trends**: Order and revenue trends over time
- **Top Products**: Best-selling products with quantity and revenue data

### 🚚 Order Tracking
- **Tracking Interface**: Visual tracking progress with status indicators
- **Status Management**: Update order status with timestamps
- **Customer Communication**: Track delivery progress and estimated delivery dates

### 📤 Export Functionality
- **Multiple Formats**: Export to CSV (Excel compatible) or JSON
- **Field Selection**: Choose which fields to include in the export
- **Date Filtering**: Export orders within specific date ranges
- **Bulk Export**: Export selected orders or all orders

## File Structure

```
orders/
├── page.tsx                          # Main orders page with tabs
├── [id]/
│   ├── page.tsx                      # Individual order details
│   └── edit/
│       └── page.tsx                  # Order editing interface
├── components/
│   ├── index.ts                      # Component exports
│   ├── orders-list.tsx               # Orders table with filtering
│   ├── order-analytics.tsx           # Analytics dashboard
│   ├── order-tracking.tsx            # Tracking management
│   ├── bulk-operations.tsx           # Bulk actions component
│   └── export-orders.tsx             # Export functionality
└── README.md                         # This file
```

## API Integration

The module integrates with the following backend APIs:

### Order Endpoints
- `GET /orders` - Get all orders (admin)
- `GET /orders/:id` - Get order by ID
- `GET /orders/user` - Get user orders
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order
- `PATCH /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Delete order

### Analytics Endpoints
- `GET /orders/analytics` - Get order analytics
- `GET /orders/:id/tracking` - Get order tracking information

## Redux Integration

The module uses Redux Toolkit for state management:

### Store Structure
```typescript
{
  orders: {
    selectedOrder: OrderData | null;
    isLoading: boolean;
    error: string | null;
    filters: {
      status: string;
      dateRange: { start: string; end: string };
      search: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }
}
```

### API Slice
- `useGetOrdersQuery()` - Fetch all orders
- `useGetOrderByIdQuery(id)` - Fetch single order
- `useGetOrderAnalyticsQuery()` - Fetch analytics data
- `useUpdateOrderMutation()` - Update order
- `useUpdateOrderStatusMutation()` - Update order status
- `useDeleteOrderMutation()` - Delete order

## Components

### OrdersList
Main component for displaying orders in a table format with:
- Search and filtering capabilities
- Bulk selection and operations
- Status badges and action buttons
- Responsive design

### OrderAnalytics
Analytics dashboard showing:
- Key performance indicators
- Status distribution charts
- Monthly trends
- Top products analysis

### OrderTracking
Tracking management interface with:
- Visual progress indicators
- Status update functionality
- Customer information display
- Delivery timeline

### BulkOperations
Bulk action component providing:
- Multi-order selection
- Batch status updates
- Bulk deletion with confirmation
- Export selected orders

### ExportOrders
Export functionality with:
- Format selection (CSV/JSON)
- Field customization
- Date range filtering
- Download management

## Usage

### Basic Order Management
```tsx
import { OrdersList } from './components/orders-list';

function OrdersPage() {
  return (
    <div>
      <OrdersList onOrderSelect={(order) => console.log(order)} />
    </div>
  );
}
```

### Analytics Dashboard
```tsx
import { OrderAnalytics } from './components/order-analytics';

function AnalyticsPage() {
  return <OrderAnalytics />;
}
```

### Order Details
```tsx
import { useGetOrderByIdQuery } from '@/lib/features/orders';

function OrderDetailsPage({ orderId }) {
  const { data, isLoading, error } = useGetOrderByIdQuery(orderId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading order</div>;
  
  return <div>{/* Order details UI */}</div>;
}
```

## Styling

The module uses Tailwind CSS with custom components from the UI library:
- Consistent color scheme with status-based colors
- Responsive grid layouts
- Interactive hover states
- Loading skeletons
- Error states

## Status Management

Order statuses follow a defined workflow:
1. **Pending** - Order placed, awaiting processing
2. **Processing** - Order being prepared
3. **Shipped** - Order dispatched
4. **Delivered** - Order completed
5. **Cancelled** - Order cancelled

Each status has associated colors and icons for visual consistency.

## Error Handling

The module includes comprehensive error handling:
- API error states with user-friendly messages
- Loading states with skeletons
- Empty states with helpful guidance
- Form validation with inline feedback

## Performance Optimizations

- Redux Toolkit Query for efficient data fetching and caching
- Lazy loading of components
- Optimized re-renders with proper state management
- Debounced search inputs
- Pagination for large datasets

## Future Enhancements

Potential improvements for the module:
- Real-time order updates with WebSocket integration
- Advanced filtering and sorting options
- Order templates and quick actions
- Integration with shipping providers
- Customer communication tools
- Advanced reporting and insights
