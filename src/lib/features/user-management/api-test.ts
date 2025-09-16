// API Endpoints Test
// This file can be used to test the API endpoints manually

import { userManagementApi } from './userManagementApi';
import { store } from '../../store';

// Test function to verify API endpoints
export const testUserManagementAPI = async () => {
  console.log('🧪 Testing User Management API Endpoints...');
  
  try {
    // Test 1: Get users
    console.log('1. Testing GET /user-management');
    const usersResult = await store.dispatch(
      userManagementApi.endpoints.getUsers.initiate({
        page: 1,
        limit: 10,
        search: '',
        role: undefined,
        status: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
    );
    console.log('✅ Get users result:', usersResult);

    // Test 2: Get user stats
    console.log('2. Testing GET /user-management/stats');
    const statsResult = await store.dispatch(
      userManagementApi.endpoints.getUserStats.initiate()
    );
    console.log('✅ Get stats result:', statsResult);

    // Test 3: Search users
    console.log('3. Testing GET /user-management/search');
    const searchResult = await store.dispatch(
      userManagementApi.endpoints.searchUsers.initiate({
        searchTerm: 'test',
        filters: { role: 'admin' }
      })
    );
    console.log('✅ Search users result:', searchResult);

    console.log('🎉 All API endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testUserManagementAPI = testUserManagementAPI;
  console.log('💡 Run testUserManagementAPI() in browser console to test API endpoints');
}
