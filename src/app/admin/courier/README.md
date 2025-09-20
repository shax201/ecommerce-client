# Courier Management Module

A comprehensive courier management system for the admin dashboard that integrates with Pathao and Steadfast courier services.

## Features

### 🔐 Credentials Management
- **Create Credentials**: Add new courier service credentials
- **Update Credentials**: Modify existing credentials
- **Delete Credentials**: Remove courier credentials
- **Toggle Status**: Activate/deactivate credentials
- **Validation**: Real-time validation of courier credentials
- **Multi-Courier Support**: Pathao and Steadfast integration

### 📦 Order Operations
- **Create Orders**: Create courier orders with detailed information
- **Bulk Orders**: Process multiple orders at once
- **Order Tracking**: Real-time tracking of courier orders
- **Status Updates**: Automatic status synchronization
- **Price Calculation**: Calculate delivery fees and estimated delivery times

### 🚚 Courier Integration
- **Available Couriers**: List all active courier services
- **Courier Validation**: Validate courier credentials and connectivity
- **Order Assignment**: Assign orders to specific couriers
- **Tracking Integration**: Real-time order tracking

## API Endpoints

### Credentials Management
```
GET    /api/v1/courier/credentials          - Get all credentials
GET    /api/v1/courier/credentials/active   - Get active couriers
GET    /api/v1/courier/credentials/:courier - Get credentials by courier
POST   /api/v1/courier/credentials          - Create credentials
PUT    /api/v1/courier/credentials/:courier - Update credentials
PATCH  /api/v1/courier/credentials/:courier/status - Toggle status
DELETE /api/v1/courier/credentials/:courier - Delete credentials
```

### Operations Management
```
GET    /api/v1/courier/operations/available - Get available couriers
GET    /api/v1/courier/operations/validate/:courier - Validate courier
POST   /api/v1/courier/operations/:courier/order - Create order
POST   /api/v1/courier/operations/:courier/bulk-order - Bulk orders
GET    /api/v1/courier/operations/:courier/status/:consignmentId - Get status
POST   /api/v1/courier/operations/:courier/calculate-price - Calculate price
```

### Order Integration
```
POST   /api/v1/courier/orders/:orderId/create - Create order with courier
PATCH  /api/v1/courier/orders/:orderId/status - Update order status
GET    /api/v1/courier/orders/:orderId/tracking - Get order tracking
POST   /api/v1/courier/orders/:orderId/calculate-price - Calculate delivery price
GET    /api/v1/courier/orders/:orderId/available-couriers - Get available couriers
```

## Components

### Main Components
- **`page.tsx`**: Main courier management page with tabbed interface
- **`courier-credentials-management.tsx`**: Credentials CRUD operations
- **`courier-operations-management.tsx`**: Courier operations and validation
- **`courier-orders-management.tsx`**: Order management and tracking

### Form Components
- **`courier-credentials-form.tsx`**: Dynamic form for courier credentials
- **`courier-order-form.tsx`**: Order creation form
- **`courier-price-calculator.tsx`**: Price calculation tool

### Utility Components
- **`courier-order-tracking.tsx`**: Order tracking display
- **`loading.tsx`**: Loading skeleton component

## Data Types

### Courier Credentials
```typescript
interface CourierCredentials {
  _id: string;
  courier: 'pathao' | 'steadfast';
  credentials: {
    // Pathao credentials
    client_id?: string;
    client_secret?: string;
    username?: string;
    password?: string;
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    base_url?: string;
    
    // Steadfast credentials
    api_key?: string;
    secret_key?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Courier Order Data
```typescript
interface CourierOrderData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerArea: string;
  customerPostCode?: string;
  items: Array<{
    name: string;
    quantity: number;
    weight: number;
    price: number;
  }>;
  deliveryCharge: number;
  totalAmount: number;
  notes?: string;
}
```

## State Management

The module uses Redux Toolkit for state management with the following structure:

### Redux Store
```typescript
interface CourierState {
  credentials: {
    list: CourierCredentials[];
    activeCouriers: CourierType[];
    selectedCourier: CourierType | null;
    isCredentialsLoading: boolean;
    credentialsError: string | null;
  };
  orders: {
    list: CourierOrder[];
    selectedOrder: CourierOrder | null;
    isOrdersLoading: boolean;
    ordersError: string | null;
  };
  pagination: CourierPagination;
  filters: CourierFilters;
  ui: {
    isCredentialsFormOpen: boolean;
    isCredentialsEditMode: boolean;
    editingCredentialsId: string | null;
    selectedCredentials: string[];
    activeTab: 'credentials' | 'orders' | 'operations';
  };
}
```

## Error Handling

### Toast Notifications
The module includes comprehensive error handling with toast notifications:

- **Success Notifications**: Green toast for successful operations
- **Error Notifications**: Red toast for failed operations
- **Warning Notifications**: Yellow toast for warnings
- **Info Notifications**: Blue toast for informational messages

### API Error Handling
- **Network Errors**: Handled with retry mechanisms
- **Validation Errors**: Displayed with specific field errors
- **Server Errors**: Shown with user-friendly messages
- **Timeout Errors**: Handled with appropriate fallbacks

## Usage

### Adding Courier Credentials
1. Navigate to the Courier Management page
2. Click on the "Credentials" tab
3. Click "Add New Credentials"
4. Select the courier service (Pathao or Steadfast)
5. Fill in the required credentials
6. Click "Create Credentials"

### Creating Courier Orders
1. Navigate to the "Operations" tab
2. Click "Create Order"
3. Fill in the order details
4. Select the courier service
5. Click "Create Order"

### Tracking Orders
1. Navigate to the "Orders" tab
2. Find the order you want to track
3. Click "Track Order"
4. View real-time tracking information

## Dependencies

### Core Dependencies
- **React**: UI framework
- **Next.js**: Full-stack framework
- **TypeScript**: Type safety
- **Redux Toolkit**: State management
- **RTK Query**: API management

### UI Dependencies
- **Shadcn/ui**: Component library
- **Radix UI**: Accessible primitives
- **Lucide React**: Icons
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Toast System
- **@radix-ui/react-toast**: Toast notifications
- **class-variance-authority**: Styling variants

## Development

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

## Testing

The module includes comprehensive error handling and loading states. All API calls are properly typed and include error boundaries.

## Security

- **Credential Encryption**: Sensitive credentials are handled securely
- **Input Validation**: All inputs are validated using Zod schemas
- **Error Sanitization**: Error messages are sanitized before display
- **Permission Checks**: All operations require appropriate permissions

## Performance

- **Lazy Loading**: Components are loaded on demand
- **Caching**: API responses are cached using RTK Query
- **Optimistic Updates**: UI updates immediately with rollback on errors
- **Debounced Search**: Search inputs are debounced for performance

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live updates
- **Bulk Operations**: Enhanced bulk operations for large datasets
- **Analytics**: Detailed analytics and reporting
- **Mobile App**: Mobile application for courier management
- **API Documentation**: Interactive API documentation
