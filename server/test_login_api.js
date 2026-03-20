import axios from 'axios';

const testLogin = async () => {
    try {
        console.log('🔍 Testing login API endpoint...');
        
        const loginData = {
            email: 'admin@xoon.com',
            password: 'admin@xoon321'
        };
        
        console.log('📤 Sending login request:', { email: loginData.email, password: '***' });
        
        const response = await axios.post('http://localhost:5000/api/users/login', loginData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Login API successful!');
        console.log('📊 Response status:', response.status);
        console.log('📊 Response data:', {
            success: response.data.success,
            user: response.data.user,
            token: response.data.token ? '***TOKEN***' : 'NO TOKEN'
        });
    } catch (error) {
        console.error('❌ Login API failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testLogin();
