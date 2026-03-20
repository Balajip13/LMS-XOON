import axios from 'axios';

const testRoleAuthorization = async () => {
    const baseURL = 'http://localhost:5000/api';
    
    // Test endpoints that require instructor role
    const instructorEndpoints = [
        '/instructor/dashboard/overview',
        '/instructor/students',
        '/instructor/earnings',
        '/instructor/reviews',
        '/instructor/reports'
    ];
    
    console.log('🔍 Testing role-based authorization...');
    
    try {
        // First, login as admin to get token
        console.log('\n📝 Logging in as admin...');
        const loginResponse = await axios.post(`${baseURL}/users/login`, {
            email: 'admin@xoon.com',
            password: 'admin@xoon321'
        });
        
        const adminToken = loginResponse.data.token;
        console.log('✅ Admin login successful');
        
        // Test admin access to instructor endpoints
        console.log('\n🔍 Testing admin access to instructor endpoints...');
        for (const endpoint of instructorEndpoints) {
            try {
                const response = await axios.get(`${baseURL}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                console.log(`✅ ${endpoint} - Admin access granted (${response.status})`);
            } catch (error) {
                if (error.response?.status === 403) {
                    console.log(`❌ ${endpoint} - Admin access denied (403)`);
                } else {
                    console.log(`⚠️ ${endpoint} - Other error: ${error.response?.status || error.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error.response?.data || error.message);
    }
    
    process.exit(0);
};

testRoleAuthorization();
