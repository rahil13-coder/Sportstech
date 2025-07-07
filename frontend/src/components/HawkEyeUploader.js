import React, { useState } from 'react';

const HawkEyeUploader = () => {
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      setStatus('');
    } else {
      setVideo(null);
      setStatus('❌ Please upload a valid video file.');
    }
  };

  const handleUpload = async () => {
    if (!video) {
      setStatus('❌ No video selected.');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);

    try {
      setStatus('⏳ Uploading...');
      const res = await fetch('http://localhost:5000/api/hawkeye/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setStatus('✅ Upload & Analysis Complete');
      } else {
        setStatus(data.error || '❌ Upload failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Something went wrong.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎯 Hawk Eye Video Upload</h2>
      <input type="file" accept="video/*" onChange={handleChange} />
      <br /><br />
      <button onClick={handleUpload}>Upload & Analyze</button>
      <p>{status}</p>

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <video width="400" controls src={result.videoPath}></video>
          <h3>Decision: {result.decision}</h3>
          <p>Ball Speed: {result.ballSpeed}</p>
          <p>Impact Point: X={result.impactPoint.x}, Y={result.impactPoint.y}</p>
        </div>
      )}
    </div>
  );
};

export default HawkEyeUploader;
