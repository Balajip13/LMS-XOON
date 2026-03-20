import axios from 'axios';

const testRegister = async () => {
    try {
        console.log('Testing registration endpoint...');
        
        const response = await axios.post('http://localhost:5000/api/users/register', {
            name: 'Test Student',
            email: 'test123@example.com',
            password: 'Student@123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Registration successful!');
        console.log('Response:', response.data);
        
    } catch (error) {
        console.error('❌ Registration failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
    
    process.exit(0);
};

testRegister();
