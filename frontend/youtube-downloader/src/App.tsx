import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';

function App() {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = async () => {
    try{
         // Send YouTube URL to the API
         const response = await axios.post('http://localhost:8080/download', { url }, { responseType: 'blob' });

         console.log(response.data);
   
         // Create a Blob from the response data
         const blob = new Blob([response.data], { type: 'video/mp4' });
   
         // Create a temporary URL for the Blob
         const blobUrl = URL.createObjectURL(blob);
   
         // Create an anchor element to trigger the download
         const anchor = document.createElement('a');
         anchor.href = blobUrl;
         anchor.download = 'video.mp4';
         document.body.appendChild(anchor);
   
         // Trigger the download
         anchor.click();
   
         // Remove the anchor element
         document.body.removeChild(anchor);
    }catch(error){
      console.error('Error downloading video:');
    }
  };

  return (
    <>
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter YouTube URL"
        style={{ padding: '10px', fontSize: '16px' }}
      />
      <br />
      <button
        style={{ backgroundColor: 'red', color: 'white', padding: '10px', fontSize: '16px', marginTop: '10px' }}
        onClick={handleSubmit}
      >
        Download Video
      </button>
    </div>
    </>
  )
}

export default App
