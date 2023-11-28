import './home.css';
import React from 'react';
import {Helmet} from 'react-helmet';
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer} from 'react-toastify';

const Home = (props) => {
    const download = () => {
        const link = document.getElementById('link').value;
        if (link === '') {
            toast.error('Please enter a link to download.', { theme: 'dark' });
        } else {
            const loading = toast.loading('Opening connection...', { theme: 'dark' });
            const socket = new WebSocket('wss://us-central1-wulfco-downloader.cloudfunctions.net/api');

            let videoChunks = [];

            socket.addEventListener('open', () => {
                console.log('WebSocket connection established.');

                // Send the video URL to the backend
                const message = { url: link };
                socket.send(JSON.stringify(message));
                toast.update(loading,{ render: 'Contacting server...', type: 'info', theme: 'dark' });
            });

            let started = false;

            socket.addEventListener('message', (event) => {
                if (!started) {
                    started = true;
                }

                const data = JSON.parse(event.data);
                if (data.type === 'metadata') {
                    // Handle video metadata
                    const videoTitle = data.title;
                    const totalBytes = data.size;
                    console.log(`Video Title: ${videoTitle}`);
                    console.log(`Total Bytes: ${totalBytes}`);

                    toast.update(loading, { render: `Starting download of ${videoTitle}...`, type: 'info', theme: 'dark', isLoading: true });
                } else if (data.type === 'chunk') {
                    // Handle received video chunk
                    const chunk = new Uint8Array(data.data).buffer; // Converting to ArrayBuffer
                    console.log(`Received chunk: ${chunk.byteLength} bytes`);
                    videoChunks.push(chunk);

                    toast.update(loading, { render: `Downloading... ${(videoChunks.length * 100 / (totalBytes / 1024 / 1024)).toFixed(2)}%`, type: 'info', theme: 'dark', isLoading: true });
                } else if (data.type === 'end') {
                    // Handle end of video streaming
                    console.log('Video streaming completed.');

                    // Assemble the video chunks into a Blob
                    const videoBlob = new Blob(videoChunks);

                    // Create a download link for the video
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(videoBlob);
                    downloadLink.download = 'video.mp4'; // Set the desired filename

                    // Simulate a click on the download link to initiate the download
                    downloadLink.click();

                    socket.close();

                    toast.update(loading, { render: 'Download completed!', type: 'success', theme: 'dark', isLoading: false });
                } else if (data.type === "status") {
                    toast.update(loading, { render: "Connection established!", type: 'info', theme: 'dark', isLoading: false });
                }
            });

            socket.addEventListener('close', () => {
                console.log('WebSocket connection closed.');
                toast.update(loading, { render: 'Connection finished.', type: 'info', theme: 'dark', autoClose: 3000, isLoading: false })
            });

            socket.addEventListener('error', (error) => {
                console.log('Error occurred:', error.message);
                socket.close();
            });
        }
    };

    return (
        <div className="home-container">
            <ToastContainer />
            <Helmet>
                <title>Youtube Downloader</title>
                <meta name="description" content="Download any youtube videos you like, free of charge." />
                <meta property="og:title" content="Youtube Downloader" />
                <meta property="og:description" content="Download any YouTube video you wish, free of charge." />
                <meta property="og:image" content="/logo-transparent.png" />
            </Helmet>
            <div className="home-container1">
                <img alt="image" src="/logo-transparent.png" className="home-image" />
                <h1 className="home-text">
                    <span>Youtube Downloader</span>
                    <br className="home-text2"></br>
                    <span>
                        <span dangerouslySetInnerHTML={{ __html: ' ' }} />
                    </span>
                </h1>
                <h1 className="home-text4">Download any youtube video here!</h1>
                <div className="home-container2">
                    <input
                        type="link"
                        id="link"
                        required={true}
                        autoFocus={true}
                        placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        className="home-textinput input"
                    />
                    <button className="home-button button" onClick={download}>
                        Download
                    </button>
                </div>
                <div className="home-links">
                    <h1 className="home-text5">Made with 💖 by Wulfco</h1>
                </div>
            </div>
        </div>
    );
};

export default Home;