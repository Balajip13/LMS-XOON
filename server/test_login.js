import axios from 'axios';

const testLogin = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/users/login', {
            email: 'admin@xoon.com',
            password: 'admin@xoon321'
        });
        console.log('Login Success:', res.data.email, 'Role:', res.data.role);
    } catch (err) {
        if (err.response) {
            console.log('Login Failed:', err.response.status, err.response.data.message);
        } else {
            console.log('Login Failed:', err.message);
        }
    }
};

testLogin();
