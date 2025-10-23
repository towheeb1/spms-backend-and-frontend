import axios from 'axios';

(async () => {
  try {
    const res = await axios.get('http://localhost:4000/medicines', { withCredentials: true });
    console.log('status', res.status);
    console.log('headers', res.headers);
    console.log('data', res.data);
  } catch (e) {
    console.error('full error:', e && e.toString ? e.toString() : e);
    if (e && e.response) {
      console.error('status', e.response.status);
      console.error('headers', e.response.headers);
      console.error('data', e.response.data);
    } else {
      console.error('message', e.message || e);
    }
  }
})();
