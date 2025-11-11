const axios = require('axios');
axios.get('http://localhost:5000/api/streaming/search', { params: { query: 'happy', maxResults: 5 }, timeout: 10000 })
  .then(res => {
    console.log('STATUS', res.status);
    console.log(JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.error('ERR FULL:', err && err.toString());
    if (err && err.response) {
      console.error('ERR RESPONSE', err.response.status, err.response.data);
    }
  });
