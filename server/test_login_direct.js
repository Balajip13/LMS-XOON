import axios from 'axios';

const testLogin = async () => {
    try {
        console.log('Testing login endpoint...');
        
        const response = await axios.post('http://localhost:5000/api/users/login', {
            email: 'admin@xoon.com',
            password: 'admin@xoon321'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', response.data);
        
    } catch (error) {
        console.error('❌ Login failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
    
    process.exit(0);
};

testLogin();
