import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';


function App() {
  const [url, setUrl] = useState<string>('');
  const [inputColor, setInputColor] = useState<string>('bg-gray-50 border text-black text-sm rounded-lg block w-80 p-2.5 bg-gray-100 border-gray-600 placeholder-gray-400 text-black mb-4');
  const [isErrorTextVisible, setErrorTextVisible] = useState<boolean>(false);

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
         setInputColor('bg-gray-50 border text-black text-sm rounded-lg block w-80 p-2.5 bg-gray-100 border-gray-600 placeholder-gray-400 text-black mb-4');
         setErrorTextVisible(false);
    }catch(error){
      setInputColor('bg-gray-50 border text-black text-sm rounded-lg block w-80 p-2.5 bg-red-50 border-red-500 placeholder-gray-400 text-black mb-4');
      setErrorTextVisible(true);
      console.error('Error downloading video:');
    }
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">YouTube Downloader</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter YouTube URL"
        className={inputColor}
      />
      <a className={isErrorTextVisible ? "justify-center text-red-500 visible " : "justify-center text-red invisible mb-4"}>Invalid URL!</a>
      <button
        className="bg-red-700 text-white px-6 py-3 rounded font-bold"
        onClick={handleSubmit}
      >
        Download Video
      </button>
    </div>
  </>
  
  )
}

export default App
