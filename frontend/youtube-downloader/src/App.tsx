import { useState } from 'react';
import LoadingSVG from './assets/loading.svg';
import './App.css';
import axios from 'axios';


function App() {
  const [url, setUrl] = useState<string>('');
  const [inputColor, setInputColor] = useState<string>('bg-gray-50 border text-black text-sm rounded-lg block w-80 p-2.5 bg-gray-100 border-gray-600 placeholder-gray-400 text-black mb-4');
  const [isErrorTextVisible, setErrorTextVisible] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false); // New loading state

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Send YouTube URL to the API
      const response = await axios.post('http://localhost:8080/download', { url }, { responseType: 'blob' });

      console.log(response.data);

      const blob = new Blob([response.data], { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = 'video.mp4';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setInputColor('bg-gray-50 border text-black text-sm rounded-lg block w-80 p-2.5 bg-gray-100 border-gray-600 placeholder-gray-400 text-black mb-4');
      setErrorTextVisible(false);

    } catch (error) {
      setInputColor('bg-gray-50 border text-black text-sm rounded-lg block w-80 p-2.5 bg-red-50 border-red-500 placeholder-gray-400 text-black mb-4');
      setErrorTextVisible(true);
      console.error('Error downloading video:');
    } finally {
      setLoading(false); // Set loading to false after the request is complete (success or failure)
    }
  };

  const svgStyle = {
    width: '50px',
    height: '50px',
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black">
      <h1 className="text-3xl font-bold ">YouTube Downloader</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter YouTube URL"
        className={inputColor}
      />
      {isLoading ? 
      <div style={svgStyle}>
        <img src={LoadingSVG} alt="loading" />
      </div> 
      : <a className={isErrorTextVisible ? "justify-center text-red-500 visible " : "justify-center text-red invisible mb-4"}>Invalid URL!</a>} 

      {/* Loading indicator */}
     

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
