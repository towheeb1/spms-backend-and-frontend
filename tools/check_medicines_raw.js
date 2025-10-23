import http from 'http';

http.get('http://localhost:4000/medicines', (res) => {
  console.log('status', res.statusCode);
  console.log('headers', res.headers);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('body', data);
  });
}).on('error', (e) => {
  console.error('error', e.message);
});
